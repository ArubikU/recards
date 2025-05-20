"use client"

import { useCustomAlerts } from "@/hooks/use-custom-alerts"
import { Room } from "@/lib/types"
import { TrashIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MouseEvent } from "react"
interface RoomCardProps {
  room: Room
  key?: string
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter()
  const { alert } = useCustomAlerts()

  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const resp = await fetch(`/api/rooms/${room.id}`, {
      method: "DELETE",
    })
    if (!resp.ok) {
      alert("Error al eliminar la sala", "error")
      return
    }
    alert("Sala eliminada", "success")
    router.refresh()
  }

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group block rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
            {room.title}
          </h2>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-gray-100 transition"
            aria-label="Eliminar sala"
          >
            <TrashIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-150" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {room.description || "Sin descripción"}
        </p>

        {room.tags && room.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {room.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {(!room.tags || room.tags.length === 0) && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
              Sin etiquetas
              </span>
              </div>
            )}
      </div>
      <div className="mt-auto w-full bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
        Creado el {new Date(room.created_at).toLocaleDateString()}
      </div>
    </Link>
  )
}
