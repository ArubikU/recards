import { generateQuizQuestions } from "@/lib/cohere"
import { consumeGenerations, createQuiz, createQuizQuestion, getSummariesByRoomId, getUserByClerkId } from "@/lib/db"
import { Quiz } from "@/lib/types"
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

    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const summaries = await getSummariesByRoomId(roomId)

    const quizs: Quiz = await generateQuizQuestions(summaries.join("\n\n"))
    if (!quizs) {
      return NextResponse.json({ error: "Failed to generate quizs" }, { status: 500 })
    }

    const createdQuiz = await createQuiz(
      roomId,
      quizs.title,
      quizs.description,
      quizs.source,
      quizs.difficulty,
      quizs.tags
    )

    //filter quizs.questions if question_text is not undefined or "undefined"
    quizs.questions = quizs.questions.filter(
      (quiz: any) => quiz.question_text !== undefined && quiz.question_text !== "undefined"
    )

    const questions = await Promise.all(
      quizs.questions.map(async (quiz: any) => {
        return await createQuizQuestion(
          createdQuiz,
          quiz.question_text,
          quiz.options,
          quiz.correct_option,
          quiz.difficulty
        )
      })
    )

    await consumeGenerations(authObj, roomId)
    const createdIds = questions.map((quiz) => quiz)
    return NextResponse.json({ ids: createdIds, success: true })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
