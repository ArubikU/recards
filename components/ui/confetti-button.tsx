"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { useEffect, useState } from "react"

interface ConfettiButtonProps extends ButtonProps {
  triggerConfetti?: boolean
}

export function ConfettiButton({ 
  children, 
  triggerConfetti = false,
  onClick,
  ...props 
}: ConfettiButtonProps) {
  const [hasTriggered, setHasTriggered] = useState(false)
  
  useEffect(() => {
    if (triggerConfetti && !hasTriggered) {
      setHasTriggered(true)
      launchConfetti()
    }
  }, [triggerConfetti, hasTriggered])
  
  const launchConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 }
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { y: 0.7 }
    })
    fire(0.2, {
      spread: 60,
      origin: { y: 0.7 }
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { y: 0.7 }
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { y: 0.7 }
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { y: 0.7 }
    })
  }
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasTriggered) {
      launchConfetti()
      setHasTriggered(true)
    }
    if (onClick) onClick(e)
  }
  
  return (
    <Button
      onClick={handleClick}
      className="relative overflow-hidden"
      {...props}
    >
      {children}
    </Button>
  )
}
