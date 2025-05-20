import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getLeftRoomsCount, getRoomsByUserId, getUserByClerkId } from "@/lib/db"
import { getTierObject } from "@/lib/getLimits"

import ErrorMessage from "@/components/error-message"
import RoomList from "./room-list"

export default async function RoomsPage() {
  const authObj = await auth()
  const clerkId = authObj.userId

  if (!clerkId) redirect("/login")

  const [user, client] = await Promise.all([
    getUserByClerkId(clerkId),
    clerkClient()
  ])

  if (!user) {
    return (
      <ErrorMessage title="Error de cuenta" message="No se pudo encontrar tu cuenta en nuestra base de datos. Por favor, contacta a soporte." backLink backLinkHref="/dashboard" backLinkText="Volver a mi cuenta"/>
    )
  }

  const userData = await client.users.getUser(clerkId)
  const currentPlan = getTierObject(userData?.publicMetadata?.plan as string || "free")
  const limits = currentPlan.limits

  const [leftRoomsCount, rooms] = await Promise.all([
    getLeftRoomsCount(authObj),
    getRoomsByUserId(user.id)
  ])


  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <RoomList
        receivedRooms={rooms}
        leftRoomsCount={leftRoomsCount}
        limits={limits}
        currentPlan={currentPlan}
      />

    </div>
  )
}
