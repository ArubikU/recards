"use client"

import EnhancedFlashcardView from "@/components/flashcards/enhanced-flashcard-view"
import Flashcard from "@/components/flashcards/flashcard"
import { TierObject } from "@/lib/getLimits"
import { Grid2X2, Layers } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function FlashcardsView({ 
  flashcards, 
  roomId ,
  plan
}: { 
  flashcards: any[],
  roomId: string,
  plan: TierObject
}) {
  const [viewMode, setViewMode] = useState<"enhanced" | "grid">("enhanced")

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 mb-4">No hay flashcards en este Room</p>
        <Link
          href={`/rooms/${roomId}`}
          className="inline-block bg-[#FF7A00] text-white px-4 py-2 rounded hover:bg-[#E56E00]"
        >
          Volver y generar flashcards
        </Link>
      </div>
    )
  }
  
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-medium">Estudia tus flashcards</h2>
        <div className="flex gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              viewMode === "grid" 
                ? "bg-[#FF7A00] text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="w-4 h-4" />
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              viewMode === "enhanced" 
                ? "bg-[#FF7A00] text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => setViewMode("enhanced")}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Estudio</span>
          </button>
        </div>
      </div>
      
      {viewMode === "enhanced" ? (
        <EnhancedFlashcardView 
          cards={flashcards.map(card => ({
            id: card.id,
            front: card.front,
            back: card.back
          }))} 
          plan={plan}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card) => (
            <Flashcard key={card.id} front={card.front} back={card.back} />
          ))}
        </div>
      )}
    </div>
  )
}
