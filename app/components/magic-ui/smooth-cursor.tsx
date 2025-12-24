"use client"

import { FC, useEffect, useRef, useState } from "react"
import { motion, useSpring } from "motion/react"
import { EyeIcon, ViewIcon } from "lucide-react"

interface Position {
  x: number
  y: number
}

export interface SmoothCursorProps {
  springConfig?: {
    damping: number
    stiffness: number
    mass: number
    restDelta: number
  }
  cursorMode?: 'default' | 'view'
}
const DefaultCursorSVG: FC = () => {
  return <RocketCursorSVG />;
};
  
const RocketCursorSVG: FC<{ color?: string }> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 32 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-rocket"
      style={{ color: color ?? "hsl(var(--foreground))" }}
    >
      {/* Rotate the rocket upright (lucide points 45deg by default) */}
      <g transform="rotate(-45 12 12)">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </g>

      {/* Inline thrusters inside SVG, kept within 24x24 viewBox */}
      <g>
        <rect x="9.5" y="18.5" width="1.6" height="3" fill="#FF4500" rx="0.8">
          <animate attributeName="height" values="3;5;3" dur="0.33s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.33s" repeatCount="indefinite" />
        </rect>
        <rect x="11.7" y="18" width="1.8" height="3.8" fill="#1E90FF" rx="0.9">
          <animate attributeName="height" values="3.8;6;3.8" dur="0.27s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.27s" repeatCount="indefinite" />
        </rect>
        <rect x="14.1" y="18.5" width="1.6" height="3" fill="#FFA500" rx="0.8">
          <animate attributeName="height" values="3;5;3" dur="0.39s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.39s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
};
  

export function SmoothCursor({
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
  cursorMode = 'default',
}: SmoothCursorProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const lastMousePos = useRef<Position>({ x: 0, y: 0 })
  const velocity = useRef<Position>({ x: 0, y: 0 })
  const lastUpdateTime = useRef(Date.now())
  const previousAngle = useRef(0)
  const accumulatedRotation = useRef(0)

  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  })
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  })

  useEffect(() => {
    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastUpdateTime.current

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        }
      }

      lastUpdateTime.current = currentTime
      lastMousePos.current = currentPos
    }

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2)
      )

      cursorX.set(currentPos.x)
      cursorY.set(currentPos.y)

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90

        let angleDiff = currentAngle - previousAngle.current
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        accumulatedRotation.current += angleDiff
        rotation.set(accumulatedRotation.current)
        previousAngle.current = currentAngle

        scale.set(0.95)
        setIsMoving(true)

        const timeout = setTimeout(() => {
          scale.set(1)
          setIsMoving(false)
        }, 150)

        return () => clearTimeout(timeout)
      }
    }

    let rafId: number
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e)
        rafId = 0
      })
    }

    document.body.style.cursor = "none"
    window.addEventListener("mousemove", throttledMouseMove)

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
      document.body.style.cursor = "auto"
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [cursorX, cursorY, rotation, scale])

  // Track theme (for high-contrast cursor colors in light mode over dark images)
  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDarkTheme(root.classList.contains("dark"))
    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const ViewCursorSVG: FC = () => {
    // Light theme: cursor becomes white + shadow for contrast on dark project screenshots.
    const viewColor = isDarkTheme ? "hsl(var(--foreground))" : "#ffffff"
    return (
      <div
        className="relative"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}
      >
        <RocketCursorSVG color={viewColor} />
        <EyeIcon className="absolute -bottom-2.5 right-0 size-5 transform -rotate-45" style={{ color: viewColor }} />
      </div>
    )
  }

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-58%",
        translateY: "-65%",
        rotate: rotation,
        scale: scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="md:block hidden"
    >
      {cursorMode === 'default' ? <DefaultCursorSVG /> : <ViewCursorSVG />}
    </motion.div>
  )
}