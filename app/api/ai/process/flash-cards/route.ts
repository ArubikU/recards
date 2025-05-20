import { generateFlashcards } from "@/lib/cohere"
import { consumeGenerations, createFlashcard, getSummariesByRoomId, getUserByClerkId } from "@/lib/db"
import { trailListJson } from "@/lib/utils"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authObj = await auth()
    const { userId: clerkId } = authObj

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { roomId} = await request.json()

    if (!roomId ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const summaries = await getSummariesByRoomId(roomId)

    const flashCards = await generateFlashcards(summaries.join("\n\n"))
    if (!flashCards) {
      return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
    }
    let parsedFlashCards: { front: string; back: string; keywords: string }[] = []
    if (Array.isArray(flashCards)) {
      parsedFlashCards = flashCards.map((flashCard) => {
        return {
          front: flashCard.front,
          back: flashCard.back,
          keywords: flashCard.keywords
        }
      })
    }else{
      parsedFlashCards = JSON.parse(trailListJson(flashCards))
    }

    const created = await Promise.all(
      parsedFlashCards.map(async (flashCard: { front: string; back: string; keywords: string }) => {
        return await createFlashcard(roomId, flashCard.front, flashCard.back, flashCard.keywords)
      })
    )
    await consumeGenerations(authObj, roomId)
    const createdIds = created.map((flashCard) => flashCard.id)
    return NextResponse.json({ ids: createdIds, success: true })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
