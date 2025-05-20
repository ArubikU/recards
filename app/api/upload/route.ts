import { createUpload, getUploadByHash } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"
import crypto from "crypto"
import { NextResponse } from "next/server"

// Función para generar un hash del archivo en el servidor
async function generateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hash = crypto.createHash('sha256')
  const data = new Uint8Array(buffer)
  hash.update(data)
  return hash.digest('hex')
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    // Verificar autenticación
    if (!userId) {
      return new NextResponse("No autorizado", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No se proporcionó un archivo", { status: 400 })
    }

    // Leer el archivo y generar hash en el servidor
    const buffer = await file.arrayBuffer()
    const hash = await generateFileHash(buffer)
    
    // Verificar si el archivo ya existe
    const existingUpload = await getUploadByHash(hash)
    
    if (existingUpload) {
      return NextResponse.json({ url: existingUpload.url })
    }

    // Subir archivo a Vercel Blob
    const { url } = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN as string,
    })

    // Guardar referencia en la base de datos
    await createUpload(hash, url)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[UPLOAD_FILE]", error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
}
