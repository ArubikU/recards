import { createRoom, getLeftRoomsCount, getUserByClerkId, updateRoomCount } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const AuthObject = await auth()
    const { userId: clerkId } = AuthObject

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)

    const leftRooms = await getLeftRoomsCount(AuthObject)
    if(leftRooms === 0) {
      return NextResponse.json({ limitReached: true }, { status: 200 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { title, description, tags } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create room in database
    const roomId = await createRoom(user.id, title, description, tags)
    await updateRoomCount(AuthObject)
    return NextResponse.json({ id: roomId, success: true })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


