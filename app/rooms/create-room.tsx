"use client"

import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateRoom({ leftRoomsCount }: { leftRoomsCount: number }) {
  const router = useRouter()
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640
  return (
    <button
      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center"
      disabled={leftRoomsCount === 0}
      onClick={() => {
      if (leftRoomsCount > 0) {
        router.push("/rooms/new")
      }
      }}
    >
      {isMobile ? (
      <PlusIcon className="w-5 h-5 m-0" />
      ) : (
      "Crear nueva Room"
      )}
    </button>
  )
}
