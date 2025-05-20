import ErrorMessage from "@/components/error-message"
import { getQuizzesByRoomId, getRoomById, getUserByClerkId, userOwnRoom } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function QuizzesPage({ params }: { params: { id: string } }) {
  const authObj = await auth()
  const { userId: clerkId } = authObj
  
  if (!clerkId) {
    redirect("/login")
  }

  // Get user from database
  const user = await getUserByClerkId(clerkId)

  if (!user) {
    return (
      <ErrorMessage title="Error de cuenta" message="No se pudo encontrar tu cuenta en nuestra base de datos. Por favor, contacta a soporte." backLink />
    )
  }


  const ownRoom = await userOwnRoom(user.id, (await params).id)
  if (!ownRoom) {
    return <ErrorMessage title="Acceso denegado" message="No tienes permiso para ver este room." backLink />
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

  // Get quizzes for this room
  const quizzes = await getQuizzesByRoomId(room.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/rooms/${room.id}`} className="text-[#FF7A00] hover:underline mb-2 inline-block">
          ← <span className="hidden md:inline">Volver al Room</span>
        </Link>
        <h1 className="text-3xl font-bold">Quizzes de {room.title}</h1>
        <p className="text-gray-600 mt-2">
          {quizzes.length} {quizzes.length === 1 ? "quiz disponible" : "quizzes disponibles"}
        </p>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Link href={`/rooms/${room.id}/quizzes/${quiz.id}`} key={quiz.id}>
              <div className="border rounded-lg p-6 hover:border-[#FF7A00] transition-colors h-full">
                <h3 className="text-xl font-medium mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                {quiz.tags && quiz.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quiz.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {quiz.difficulty && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Dificultad:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full mx-0.5 ${
                            i < quiz.difficulty ? "bg-[#FF7A00]" : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {quiz.questions && (
                  <p className="text-sm text-gray-500 mt-4">
                    {quiz.questions.length} {quiz.questions.length === 1 ? "pregunta" : "preguntas"}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No hay quizzes disponibles</h3>
          <p className="text-gray-500 mb-6">Aún no se han generado quizzes para este room.</p>
          <Link href={`/rooms/${room.id}`} className="btn-primary">
            Volver al Room
          </Link>
        </div>
      )}
    </div>
  )
}
