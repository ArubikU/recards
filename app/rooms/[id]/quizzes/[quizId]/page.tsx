import QuizPageClient from "@/components/quizzes/quiz-page-client"
import { getQuizById, getRoomById, getUserByClerkId } from "@/lib/db"
import { Quiz } from "@/lib/types"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import QuizDownload from "./quiz-download"

export default async function QuizPage({ params }: { params: { id: string; quizId: string } }) {
  const authObj = await auth()
  const { userId: clerkId } = authObj

  if (!clerkId) {
    redirect("/login")
  }

  // Get user from database
  const user = await getUserByClerkId(clerkId)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error de cuenta</h1>
        <p>No se pudo encontrar tu cuenta en nuestra base de datos. Por favor, contacta a soporte.</p>
      </div>
    )
  }

  // Get room details
  const room = await getRoomById((await params).id)

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Room no encontrado</h1>
        <p>El room que buscas no existe o no tienes acceso a él.</p>
        <Link href="/rooms" className="text-[#FF7A00] hover:underline mt-4 inline-block">
          Volver a mis Rooms
        </Link>
      </div>
    )
  }

  // Check if user owns this room
  if (room.user_id !== user.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
        <p>No tienes permiso para ver este room.</p>
        <Link href="/rooms" className="text-[#FF7A00] hover:underline mt-4 inline-block">
          Volver a mis Rooms
        </Link>
      </div>
    )
  }

  // Get the specific quiz
  const param = await params
  const quiz: Quiz | null = await getQuizById(param.quizId)

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Quiz no encontrado</h1>
        <p>El quiz que buscas no existe o ha sido eliminado.</p>
        <Link href={`/rooms/${room.id}/quizzes`} className="text-[#FF7A00] hover:underline mt-4 inline-block">
          Volver a los Quizzes
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/rooms/${room.id}/quizzes`} className="text-[#FF7A00] hover:underline mb-2 inline-block">
          ← <span className="hidden md:inline">Volver a los Quizzes</span>
        </Link>
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        <p className="text-gray-600 mt-2">{quiz.description}</p>



        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quiz.tags.map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {quiz.difficulty && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-700 mr-2">Dificultad:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full mx-0.5 ${i < quiz.difficulty ? "bg-[#FF7A00]" : "bg-gray-200"
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {quiz.source && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Fuente:</span> {quiz.source}
          </div>
        )}
      </div>
      <div>

        <QuizDownload quiz={quiz} />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Preguntas ({quiz.questions?.length || 0})</h2>
          {quiz.questions && quiz.questions.length > 0 ? (
            <QuizPageClient
              questions={quiz.questions as any[]}
              quizTitle={quiz.title}
              roomId={room.id}
              quizId={quiz.id!}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Este quiz no tiene preguntas.</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href={`/rooms/${room.id}/quizzes`} className="btn-secondary">
            Volver a los Quizzes
          </Link>
        </div>
      </div>
    </div>
  )
}
