import QuizQuestionsClient from "@/components/quizzes/quiz-questions-client";
import { getQuizById, isTheirRoom } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface QuizQuestionPageProps {
  params: {
    id: string;
    quizId: string;
  };
}

export default async function QuizQuestionsPage({ params }: QuizQuestionPageProps) {
  const { id: roomId, quizId } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/login");
  }

  try {
    // Obtener la sala para verificar acceso
    const isRoom = await isTheirRoom(clerkId, roomId);
    if (!isRoom) {
      redirect("/rooms");
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      redirect(`/rooms/${roomId}/quizzes`);
    }

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Todas las preguntas: {quiz.title}</h1>
        <QuizQuestionsClient 
          questions={quiz.questions}
          quizTitle={quiz.title}
          roomId={roomId}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading quiz:", error);
    redirect("/dashboard");
  }
}