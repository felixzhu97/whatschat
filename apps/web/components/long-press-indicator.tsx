"use client"

import { useEffect, useState } from "react"

interface LongPressIndicatorProps {
  isActive: boolean
  duration?: number
  onComplete?: () => void
}

export function LongPressIndicator({ isActive, duration = 500, onComplete }: LongPressIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [isActive, duration, onComplete])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-black/10 rounded-lg">
        <div
          className="h-full bg-blue-500/20 rounded-lg transition-all duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center bg-white/90">
          <div
            className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"
            style={{
              animationDuration: `${duration}ms`,
              animationIterationCount: progress >= 100 ? 0 : "infinite",
            }}
          />
        </div>
      </div>
    </div>
  )
}
