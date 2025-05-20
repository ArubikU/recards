import { put } from "@vercel/blob"
import { createUpload, getHash, getUploadByHash } from "./db"


// Función para uso del servidor que puede ser llamada directamente desde el servidor
export async function uploadFileServer(file: File) {
  try {
    const hash = await getHash(file)
    const existingUpload = await getUploadByHash(hash)
    if (existingUpload) {
      return existingUpload.url
    }
    const { url } = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    await createUpload(hash, url)

    return url
  } catch (error) {
    console.error("Error uploading file to Vercel Blob:", error)
    throw error
  }
}

export async function readFile(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Error al leer el archivo")
    }
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error("Error reading file from Vercel Blob:", error)
    throw error
  }
}