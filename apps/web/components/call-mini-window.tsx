"use client"

import type React from "react"

import { useState } from "react"
import { PhoneOff, Maximize, Mic, MicOff, Video, VideoOff } from "lucide-react"
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
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  if (!callState.isActive || !callState.isMinimized) return null

  return (
    <div
      className={`fixed z-50 w-80 h-48 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 视频区域 */}
      <div className="relative h-32 bg-gray-800">
        {callState.callType === "video" && !callState.isVideoOff && localStream ? (
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Avatar className="w-16 h-16">
              <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
              <AvatarFallback>{callState.contactName[0]}</AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* 状态指示器 */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs">{formatDuration(callState.duration)}</span>
        </div>

        {/* 最大化按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 w-6 h-6 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            onMaximize()
          }}
        >
          <Maximize className="w-3 h-3" />
        </Button>
      </div>

      {/* 控制区域 */}
      <div className="p-3 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-white text-sm font-medium truncate">{callState.contactName}</h4>
            <p className="text-gray-400 text-xs">{callState.callType === "video" ? "视频通话" : "语音通话"}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 静音按钮 */}
            <Button
              variant={callState.isMuted ? "destructive" : "ghost"}
              size="icon"
              className="w-8 h-8 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                // 这里应该调用静音切换函数
              }}
            >
              {callState.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </Button>

            {/* 视频按钮 */}
            {callState.callType === "video" && (
              <Button
                variant={callState.isVideoOff ? "destructive" : "ghost"}
                size="icon"
                className="w-8 h-8 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  // 这里应该调用视频切换函数
                }}
              >
                {callState.isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              </Button>
            )}

            {/* 挂断按钮 */}
            <Button
              variant="destructive"
              size="icon"
              className="w-8 h-8 bg-red-500 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation()
                onEndCall()
              }}
            >
              <PhoneOff className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
