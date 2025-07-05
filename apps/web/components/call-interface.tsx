"use client"

import { useEffect, useRef } from "react"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MoreVertical, Minimize2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { CallState } from "../types"

interface CallInterfaceProps {
  callState: CallState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onEndCall: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleSpeaker: () => void
  onMinimize?: () => void
  formatDuration: (seconds: number) => string
}

export function CallInterface({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onMinimize,
  formatDuration,
}: CallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // 设置本地视频流
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // 设置远程视频流（模拟）
  useEffect(() => {
    if (remoteVideoRef.current && callState.status === "connected") {
      // 模拟远程视频流
      if (callState.callType === "video") {
        // 这里可以设置模拟的远程视频流
      }
    }
  }, [remoteStream, callState.status, callState.callType])

  const getStatusText = () => {
    switch (callState.status) {
      case "calling":
        return "正在呼叫..."
      case "ringing":
        return "来电中..."
      case "connected":
        return formatDuration(callState.duration)
      case "ended":
        return "通话已结束"
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* 头部信息 */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <AvatarFallback>{callState.contactName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{callState.contactName}</h3>
            <p className="text-sm text-gray-300">{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onMinimize && (
            <Button variant="ghost" size="icon" onClick={onMinimize} className="text-white hover:bg-gray-800">
              <Minimize2 className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 视频区域 */}
      <div className="flex-1 relative">
        {callState.callType === "video" ? (
          <>
            {/* 远程视频 */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              {callState.status === "connected" ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : (
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-4xl">{callState.contactName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xl">{callState.contactName}</p>
                  <p className="text-gray-300">{getStatusText()}</p>
                </div>
              )}
            </div>

            {/* 本地视频（小窗口） */}
            {!callState.isVideoOff && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            )}
          </>
        ) : (
          /* 语音通话界面 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-48 w-48 mx-auto mb-8">
                <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
                <AvatarFallback className="text-6xl">{callState.contactName[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-white text-3xl font-light mb-2">{callState.contactName}</h2>
              <p className="text-gray-300 text-xl">{getStatusText()}</p>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="p-6">
        <div className="flex items-center justify-center gap-6">
          {/* 静音按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full ${
              callState.isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleMute}
          >
            {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {/* 扬声器按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full ${
              callState.isSpeakerOn ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          {/* 视频按钮（仅视频通话时显示） */}
          {callState.callType === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full ${
                callState.isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          {/* 挂断按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
