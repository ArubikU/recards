import { questionText } from "@/lib/cohere"
import { createChatHistory, extractTextFromDocument, getChatHistoryByDocumentId, getSummaryById, getUserByClerkId } from "@/lib/db"
import { getTierObject } from "@/lib/getLimits"
import { chatHistory } from "@/lib/types"
import { auth, clerkClient } from "@clerk/nextjs/server"
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
    const client = await clerkClient()
    const userData = await client.users.getUser(clerkId)
    const currentPlan = getTierObject(userData?.publicMetadata?.plan as string | undefined || "free")
    if(!(currentPlan.isUltimate || currentPlan.isUltra)){
        return NextResponse.json({ error: "This feature is only available for Ultimate and Ultra plans" }, { status: 403 })
    }

    const { lastMessages, message, documentId } = await request.json()
    if (!lastMessages || !message || !documentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const summary = await getSummaryById(documentId)
    const document = await extractTextFromDocument(documentId)
    const response = await questionText(message,  summary, "You are a chatbot from Nootiq devs, dont answer with things not related to study.",lastMessages,document)
    if (!response) {
      return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
    }
    createChatHistory(documentId, clerkId, message, response)
    return NextResponse.json({ response }, { status: 200 })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const documentId = searchParams.get('documentId')
        
        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId parameter" }, { status: 400 })
        }
        
        const chat_history: chatHistory = await getChatHistoryByDocumentId(documentId, clerkId) as any
        if (!chat_history) {
            //return empty array if no chat history found
            return NextResponse.json({ chat_history: [] }, { status: 200 })
        }
        return NextResponse.json({ chat_history }, { status: 200 })
    } catch (error) {
        console.error("Error creating document:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}