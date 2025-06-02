"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface GhibliAvatarProps {
  initials: string
  color: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function GhibliAvatar({ initials, color, size = "md", className }: GhibliAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background color
    ctx.fillStyle = getColorHex(color)
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw Ghibli-style face
    drawGhibliStyleFace(ctx, canvas.width, canvas.height, initials)

    setLoaded(true)
  }, [initials, color])

  function getColorHex(color: string): string {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      green: "#22c55e",
      purple: "#a855f7",
      red: "#ef4444",
      amber: "#f59e0b",
      indigo: "#6366f1",
      emerald: "#10b981",
      pink: "#ec4899",
      orange: "#f97316",
      teal: "#14b8a6",
      violet: "#8b5cf6",
      lime: "#84cc16",
      sky: "#0ea5e9",
      cyan: "#06b6d4",
    }

    return colorMap[color] || "#3b82f6"
  }

  function drawGhibliStyleFace(ctx: CanvasRenderingContext2D, width: number, height: number, initials: string) {
    const centerX = width / 2
    const centerY = height / 2
    const radius = width / 2

    // Draw eyes (Ghibli characters often have large, expressive eyes)
    const eyeSize = radius * 0.15
    const eyeOffsetX = radius * 0.2
    const eyeOffsetY = -radius * 0.05

    // Left eye
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.ellipse(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Right eye
    ctx.beginPath()
    ctx.ellipse(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Eye pupils
    ctx.fillStyle = "#000000"
    const pupilSize = eyeSize * 0.5

    // Left pupil
    ctx.beginPath()
    ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, pupilSize, 0, Math.PI * 2)
    ctx.fill()

    // Right pupil
    ctx.beginPath()
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, pupilSize, 0, Math.PI * 2)
    ctx.fill()

    // Draw a simple smile (Ghibli characters often have simple, expressive mouths)
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = radius * 0.05
    ctx.beginPath()
    ctx.arc(centerX, centerY + radius * 0.2, radius * 0.2, 0.1 * Math.PI, 0.9 * Math.PI)
    ctx.stroke()

    // Add the initials as a subtle detail
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${radius * 0.4}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initials, centerX, centerY + radius * 0.5)
  }

  return (
    <Avatar className={cn(sizeMap[size], "relative", className)}>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="absolute inset-0 w-full h-full rounded-full"
        style={{ opacity: loaded ? 1 : 0 }}
      />
      <AvatarFallback className={`bg-${color}-600 text-white font-bold`}>{initials}</AvatarFallback>
    </Avatar>
  )
}
