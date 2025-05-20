import { createDocument, getDocumentsByRoomId, getUserByClerkId } from "@/lib/db"
import { getTierObject, importTypes } from "@/lib/getLimits"
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

    const { roomId, url, type } = await request.json()

    if (!roomId || !url || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verificar el límite de archivos por sala
    const existingDocuments = await getDocumentsByRoomId(roomId)
    const client = await clerkClient()
    const userData = await client.users.getUser(clerkId)
    const currentPlan = getTierObject(userData?.publicMetadata?.plan as string | undefined || "free")
    const limits = currentPlan.limits

    if(currentPlan.importTypes.includes(type as importTypes) === false) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 403 }
      )
    }



    if (existingDocuments.length >= limits.filesPerRoom) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de documentos para esta sala" }, 
        { status: 403 }
      )
    }

    // Create document in database
    const documentId = await createDocument(roomId, url, type as importTypes)

    return NextResponse.json({ id: documentId, success: true })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
