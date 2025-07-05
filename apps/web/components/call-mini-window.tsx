"use client"

import { useRef, useEffect } from "react"
import { PhoneOff, Maximize2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { CallState } from "../types"

interface CallMiniWindowProps {
  callState: CallState
  localStream: MediaStream | null
  onEndCall: () => void
  onMaximize: () => void
  formatDuration: (seconds: number) => string
}

export function CallMiniWindow({ callState, localStream, onEndCall, onMaximize, formatDuration }: CallMiniWindowProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  return (
    <div className="fixed bottom-4 right-4 w-80 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-2xl z-40">
      {/* 视频区域 */}
      <div className="relative h-32 bg-gray-800">
        {callState.callType === "video" && !callState.isVideoOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Avatar className="h-16 w-16">
              <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xl">{callState.contactName[0]}</AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* 最大化按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-white hover:bg-gray-700"
          onClick={onMaximize}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 信息和控制区域 */}
      <div className="p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{callState.contactName}</p>
            <p className="text-sm text-gray-300">{formatDuration(callState.duration)}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white ml-2"
            onClick={onEndCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
