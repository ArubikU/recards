"use client"

import type React from "react"

import { getTierObject, importTypes } from "@/lib/getLimits"
import { useUser } from "@clerk/nextjs"
import { useRef, useState } from "react"

interface UploadDocumentProps {
  roomId: string
  onUploadComplete?: () => void
  aiGenerationsLeft: number
  aiGenerationsLimit: number
  filesCount?: number
  filesPerRoomLimit: number
}

export default function DocumentUpload({ roomId, onUploadComplete, aiGenerationsLeft, aiGenerationsLimit, filesCount = 0, filesPerRoomLimit = 1 }: UploadDocumentProps) {
  const { user } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<importTypes>("pdf")
  const [link, setLink] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user plan from metadata
  const userPlan = getTierObject((user?.publicMetadata?.plan as string) || "free")

  // Check if file upload is allowed based on limits
  const canUploadMoreFiles = filesCount < filesPerRoomLimit

  // Function to upload a file to Vercel Blob Storage
  const uploadFile = async (file: File) => {
    try {
      // Crear un FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Llamar a la API para subir el archivo
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir el archivo")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading file to Vercel Blob:", error)
      throw error
    }
  }
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF")
      return
    }
    

    setIsUploading(true)

    try {
      // Upload file to Vercel Blob (esta función debería estar adaptada para cliente)
      const url = await uploadFile(file)

      // Save document reference in database through API
      const response = await saveDocument(url, uploadType)

      if (!response.success) {
        throw new Error(response.error || "Error al guardar el documento")
      }


      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete()
      } else {
        // Refresh the page to show the new document
        window.location.reload()
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      let errorMessage = "Error al subir el archivo. Por favor, intenta de nuevo."

      if ((error as Error).message.includes("límite de documentos")) {
        errorMessage = "Has alcanzado el límite de documentos para esta sala."
      }

      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!link) return

    // Basic URL validation
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      alert("Por favor, ingresa una URL válida")
      return
    }

    setIsUploading(true)

    try {
      // Save document reference in database
      const response = await saveDocument(link, "pdf-link")

      if (!response.success) {
        throw new Error(response.error || "Error al guardar el enlace")
      }


      // Reset form
      setLink("")

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete()
      } else {
        // Refresh the page to show the new document
        window.location.reload()
      }
    } catch (error) {
      console.error("Error saving link:", error)
      let errorMessage = "Error al guardar el enlace. Por favor, intenta de nuevo."

      if ((error as Error).message.includes("límite de documentos")) {
        errorMessage = "Has alcanzado el límite de documentos para esta sala."
      }

      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const saveDocument = async (url: string, type: importTypes) => {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId,
        url,
        type,
      }),
    })

    if (!response.ok) {
      throw new Error("Error al guardar el documento")
    }

    return response.json()
  }



  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold">Subir Documento</h2>
      </div>
      <div className="card-body">
        <div className="flex border-b mb-4">
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as importTypes)}
          disabled={isUploading || !canUploadMoreFiles}
          className="input"
        >
          {userPlan.importTypes.map((type) => (
            <option key={type} value={type}>
              {type === "pdf"
          ? "PDF"
          : type === "pdf-link"
          ? "Enlace"
          : type === "img"
          ? "Imagen"
          : type === "csv"
          ? "CSV"
          : type === "md"
          ? "Markdown"
          : "Otro"}
            </option>
          ))}
        </select>
        </div>


        {uploadType === "pdf" && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Sube un archivo PDF para generar flashcards y quizzes automáticamente.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-[#FF7A00] file:text-white
          hover:file:bg-[#E56E00]
              "
              disabled={isUploading || !canUploadMoreFiles}
            />
            {!canUploadMoreFiles && (
              <p className="text-xs text-red-500 mt-2">
          Has alcanzado el límite de archivos para esta sala.
          {!userPlan.isUltimate && " Considera actualizar tu plan para obtener más espacio."}
              </p>
            )}
          </div>
        )}

        {uploadType === "img" && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Sube una imagen (JPG, PNG) para generar flashcards y quizzes automáticamente.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-[#FF7A00] file:text-white
          hover:file:bg-[#E56E00]
              "
              disabled={isUploading || !canUploadMoreFiles}
            />
            {!canUploadMoreFiles && (
              <p className="text-xs text-red-500 mt-2">
          Has alcanzado el límite de imágenes para esta sala.
          {!userPlan.isUltimate && " Considera actualizar tu plan para obtener más espacio."}
              </p>
            )}
          </div>
        )}

        {uploadType === "csv" && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Sube un archivo CSV para importar datos y generar flashcards y quizzes automáticamente.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-[#FF7A00] file:text-white
          hover:file:bg-[#E56E00]
              "
              disabled={isUploading || !canUploadMoreFiles}
            />
            {!canUploadMoreFiles && (
              <p className="text-xs text-red-500 mt-2">
          Has alcanzado el límite de archivos CSV para esta sala.
          {!userPlan.isUltimate && " Considera actualizar tu plan para obtener más espacio."}
              </p>
            )}
          </div>
        )}

        {uploadType === "pdf-link" && (
          <form onSubmit={handleLinkSubmit}>
            <p className="text-sm text-gray-600 mb-4">
              Añade un enlace a un PDF, artículo o página web para generar flashcards y quizzes.
            </p>
            <div className="flex">
              <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://ejemplo.com/documento.pdf"
          className="input flex-grow"
          disabled={isUploading || !canUploadMoreFiles}
          required
              />
              <button type="submit" className="btn-primary ml-2" disabled={isUploading || !canUploadMoreFiles}>
          {isUploading ? "Añadiendo..." : "Añadir"}
              </button>
            </div>
            {!canUploadMoreFiles && (
              <p className="text-xs text-red-500 mt-2">
          Has alcanzado el límite de enlaces para esta sala.
          {!userPlan.isUltimate && " Considera actualizar tu plan para obtener más espacio."}
              </p>
            )}
          </form>
        )}

        {/* AI Generation Option */}
        <div className="mt-4">
          <div className="text-xs text-gray-500 mt-1">
            {!userPlan.isUltimate && <>Generaciones de IA disponibles: {aiGenerationsLeft} de {aiGenerationsLimit}</>}
            <p></p>
            {!userPlan.isUltimate && (<>Documentos: {filesCount} de {filesPerRoomLimit} permitidos</>
            )}
            {!userPlan.isUltimate && (
              <p className="text-xs text-red-500 mt-2">
                Has alcanzado el límite de generaciones de IA para esta sala.
              </p>
            )}
            {!canUploadMoreFiles && userPlan.isUltimate && (
              <p className="text-xs text-red-500 mt-2">
                Has alcanzado el límite de archivos para esta sala.
              </p>
            )}
            {!userPlan.isUltimate && (
              <span className="inline-flex items-center ml-2 group relative">
              <svg
                className="w-4 h-4 text-[#FF7A00] group-hover:text-[#1E293B] transition-colors cursor-pointer"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="1" />
              </svg>
              <span
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded bg-[#FF7A00] text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-auto transition-opacity z-20 shadow-lg"
                style={{ whiteSpace: "normal" }}
                tabIndex={-1}
                role="tooltip"
              >
                Considera actualizar tu plan para obtener más espacio.
              </span>
              </span>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Subiendo documento...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-full bg-[#FF7A00] rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
