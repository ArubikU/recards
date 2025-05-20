"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewRoomPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      return
    }

    setIsSubmitting(true)

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tags: tagsArray,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear el room")
      }

      const data = await response.json()
      if(data.limitReached) {
        alert("Has alcanzado el límite de rooms. Por favor, elimina uno para crear otro.")
        return
      }
      router.push(`/rooms/${data.id}`)
    } catch (error) {
      console.error("Error creating room:", error)
      alert("Ocurrió un error al crear el room. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crear Nuevo Room</h1>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Información del Room</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="Ej: Fundamentos de Biología"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[100px]"
                  placeholder="Describe brevemente el contenido de este room"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: biología, ciencia, universidad"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
