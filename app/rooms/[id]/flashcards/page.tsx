import ErrorMessage from "@/components/error-message"
import EnhancedFlashcardView from "@/components/flashcards/enhanced-flashcard-view"
import { getFlashcardsByRoomId, getRoomById, getUserByClerkId, userOwnRoom } from "@/lib/db"
import { getTierObject } from "@/lib/getLimits"
import { auth, clerkClient } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RoomFlashcardsPage({
    params,
}: {
    params: { id: string }
}) {
    const authObject = await auth()
    const { userId: clerkId } = authObject
    const roomId = (await params).id

    if (!clerkId) {
        redirect("/login")
    }

    // Get user from database
    const user = await getUserByClerkId(clerkId)
    

    const client = await clerkClient()
    const userData = await client.users.getUser(clerkId)
    const currentPlan = userData?.publicMetadata?.plan as string | undefined || "free"
    const plan = getTierObject(currentPlan)

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Error de cuenta</h1>
                <p>No se pudo encontrar tu cuenta en nuestra base de datos. Por favor, contacta a soporte.</p>
            </div>
        )
    }

  const ownRoom = await userOwnRoom(user.id, (await params).id)
  if (!ownRoom) {
    return <ErrorMessage title="Acceso denegado" message="No tienes permiso para ver este room." backLink />
  }
    // Get room details
    const room = await getRoomById(roomId)

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


    // Get flashcards from room
    const flashcards = await getFlashcardsByRoomId(roomId)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href={`/rooms/${roomId}`} className="text-[#FF7A00] hover:underline mb-2 inline-block">
                    ← <span className="hidden md:inline">Volver al Room</span>
                </Link>
                <h1 className="text-3xl font-bold">Flashcards: {room.title}</h1>
                {room.description && <p className="text-gray-600 mt-2">{room.description}</p>}
            </div>
            {flashcards.length > 0 ? (
                <div className="mx-auto max-w-4xl">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-medium">Estudia tus flashcards</h2>
                    </div>

                    <EnhancedFlashcardView
                        cards={flashcards.map(card => ({
                            id: card.id,
                            front: card.front,
                            back: card.back,
                            keywords: card.keywords,
                        }))}
                        plan ={plan}
                    />
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600 mb-4">No hay flashcards en este Room</p>
                    <Link
                        href={`/rooms/${roomId}`}
                        className="inline-block bg-[#FF7A00] text-white px-4 py-2 rounded hover:bg-[#E56E00]"
                    >
                        Volver y generar flashcards
                    </Link>
                </div>
            )}
        </div>
    )
}
