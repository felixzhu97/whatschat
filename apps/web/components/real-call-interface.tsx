"use client"

import { useRef, useEffect } from "react"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { RTCCallState } from "../lib/webrtc"

interface RealCallInterfaceProps {
  callState: RTCCallState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onEndCall: () => void
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleSpeaker: () => void
  formatDuration: (seconds: number) => string
}

export function RealCallInterface({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  formatDuration,
}: RealCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // 设置本地视频流
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // 设置远程视频流
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const getStatusText = () => {
    switch (callState.status) {
      case "calling":
        return "正在呼叫..."
      case "ringing":
        return "响铃中..."
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
      <div className="flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl">{callState.contactName[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-light mb-2">{callState.contactName}</h2>
          <p className="text-gray-300 text-lg">{getStatusText()}</p>
          <p className="text-gray-400 text-sm mt-1">{callState.callType === "video" ? "视频通话" : "语音通话"}</p>
        </div>
      </div>

      {/* 视频区域 */}
      <div className="flex-1 relative">
        {callState.callType === "video" ? (
          <>
            {/* 远程视频 */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              {remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-4xl">{callState.contactName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xl">{callState.contactName}</p>
                  <p className="text-gray-300">等待视频连接...</p>
                </div>
              )}
            </div>

            {/* 本地视频（小窗口） */}
            {localStream && !callState.isVideoOff && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
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

            {/* 视频关闭提示 */}
            {callState.isVideoOff && (
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-white">
                <VideoOff className="h-8 w-8 text-white" />
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
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="p-8">
        <div className="flex items-center justify-center gap-8">
          {/* 静音按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-16 w-16 rounded-full ${
              callState.isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleMute}
          >
            {callState.isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>

          {/* 扬声器按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-16 w-16 rounded-full ${
              callState.isSpeakerOn ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
            } text-white`}
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? <Volume2 className="h-8 w-8" /> : <VolumeX className="h-8 w-8" />}
          </Button>

          {/* 视频按钮（仅视频通话时显示） */}
          {callState.callType === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-16 w-16 rounded-full ${
                callState.isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"
              } text-white`}
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? <VideoOff className="h-8 w-8" /> : <Video className="h-8 w-8" />}
            </Button>
          )}

          {/* 挂断按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={onEndCall}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}
