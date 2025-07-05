"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface UseLongPressOptions {
  onLongPress: () => void
  onPress?: () => void
  delay?: number
  shouldPreventDefault?: boolean
}

export function useLongPress({ onLongPress, onPress, delay = 500, shouldPreventDefault = true }: UseLongPressOptions) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<EventTarget>()

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, { passive: false })
        target.current = event.target
      }

      timeout.current = setTimeout(() => {
        onLongPress()
        setIsLongPressing(true)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault],
  )

  const clear = useCallback(
    (event?: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current)
      shouldTriggerClick && !isLongPressing && onPress && onPress()

      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault)
      }

      setIsLongPressing(false)
    },
    [shouldPreventDefault, onPress, isLongPressing],
  )

  const preventDefault = (event: Event) => {
    if (!("touches" in event)) {
      return
    }

    if (event.touches.length < 2 && event.preventDefault) {
      event.preventDefault()
    }
  }

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    isLongPressing,
  }
}
