"use client"

import { useState } from "react"

interface FlashcardProps {
  front: string
  back: string
}

export default function Flashcard({ front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className={`flashcard ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
      <div className="flashcard-front">
        <p className="text-xl font-medium">{front}</p>
      </div>
      <div className="flashcard-back">
        <p>{back}</p>
      </div>
    </div>
  )
}
