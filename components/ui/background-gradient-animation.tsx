"use client"

import { useEffect, useRef } from "react"

// Define proper types for the points
type Point = {
  x: number
  y: number
  vx: number
  vy: number
  origX?: number
  origY?: number
  active?: boolean
}

export function BackgroundGradientAnimation({
  gradientBackgroundStart = "rgba(120, 119, 198, 0.15)",
  gradientBackgroundEnd = "rgba(255, 255, 255, 0)",
  firstColor = "rgba(125, 39, 255, 0.4)",
  secondColor = "rgba(0, 87, 255, 0.4)",
  thirdColor = "rgba(0, 214, 242, 0.4)",
  pointerColor = "rgba(140, 100, 255, 0.5)",
  size = "100%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string
  gradientBackgroundEnd?: string
  firstColor?: string
  secondColor?: string
  thirdColor?: string
  pointerColor?: string
  size?: string
  blendingValue?: string
  children?: React.ReactNode
  className?: string
  interactive?: boolean
  containerClassName?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<{ x: number; y: number; width: number }>({
    x: 0,
    y: 0,
    width: 0,
  })
  const pointsRef = useRef<Point[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvasContainerRef.current) {
          if (canvas) {
            canvas.width = entry.contentRect.width
            canvas.height = entry.contentRect.height
          }
          initializePoints()
        }
      }
    })

    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current)
    }

    const initializePoints = () => {
      const initialPoints: Point[] = [
        {
          x: canvas.width * 0.3,
          y: canvas.height * 0.4,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15
        },
        {
          x: canvas.width * 0.7,
          y: canvas.height * 0.5,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15
        },
        {
          x: canvas.width * 0.5,
          y: canvas.height * 0.6,
          vx: Math.random() * 0.3 - 0.15,
          vy: Math.random() * 0.3 - 0.15
        }
      ]

      // Store original positions
      initialPoints.forEach(point => {
        point.origX = point.x
        point.origY = point.y
      })

      pointsRef.current = initialPoints
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvasContainerRef.current) return

      const rect = canvasContainerRef.current.getBoundingClientRect()
      pointerRef.current.x = e.clientX - rect.left
      pointerRef.current.y = e.clientY - rect.top
      pointerRef.current.width = 400
    }

    const animatePoints = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const createGradient = (point: Point, color: string) => {
        const radius = Math.max(canvas.width, canvas.height) * 0.3
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        return gradient
      }

      // Update and render pointer gradient if active
      if (interactive && pointerRef.current.width > 0) {
        const pointerGradient = ctx.createRadialGradient(
          pointerRef.current.x,
          pointerRef.current.y,
          0,
          pointerRef.current.x,
          pointerRef.current.y,
          pointerRef.current.width
        )
        pointerGradient.addColorStop(0, pointerColor)
        pointerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = pointerGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Update and render gradients
      pointsRef.current.forEach((point, index) => {
        // Move points
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges with a buffer
        const buffer = 100
        if (point.x < -buffer || point.x > canvas.width + buffer) point.vx *= -1
        if (point.y < -buffer || point.y > canvas.height + buffer) point.vy *= -1

        // Set colors based on index
        let color
        if (index === 0) color = firstColor
        else if (index === 1) color = secondColor
        else color = thirdColor

        // Create and apply gradient
        const gradient = createGradient(point, color)
        ctx.globalCompositeOperation = blendingValue as GlobalCompositeOperation
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      requestAnimationFrame(animatePoints)
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    initializePoints()
    animatePoints()

    return () => {
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      resizeObserver.disconnect()
    }
  }, [firstColor, secondColor, thirdColor, pointerColor, blendingValue, interactive])

  return (
    <div
      ref={canvasContainerRef}
      className={`absolute inset-0 overflow-hidden ${containerClassName || ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at top left, ${gradientBackgroundStart}, transparent 55%), radial-gradient(circle at bottom right, ${gradientBackgroundEnd}, transparent 55%)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${className || ""}`}
        style={{ filter: "blur(40px)", opacity: 0.8 }}
      />
      {children}
    </div>
  )
}
