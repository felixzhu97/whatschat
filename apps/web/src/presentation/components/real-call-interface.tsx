"use client"

import { useRef, useEffect } from "react"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Button } from "@/src/presentation/components/ui/button"
import type { RTCCallState } from "@/src/lib/webrtc"

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

  const controlBtnBase =
    "h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
  const controlBtnActive = "bg-[#25D366] hover:bg-[#20BD5C] text-white"
  const controlBtnOff = "bg-white/20 hover:bg-red-500/80 text-white"

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B141A]">
      {/* 顶部条：联系人 + 状态/时长 */}
      <div className="flex shrink-0 items-center justify-center gap-3 px-4 py-3 text-white">
        <Avatar className="h-10 w-10">
          <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
          <AvatarFallback className="text-sm bg-[#2A3942]">{callState.contactName[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-base font-medium">{callState.contactName}</p>
          <p className="text-sm text-[#8696A0]">
            {getStatusText()}
            {callState.callType === "video" && " · 视频通话"}
            {callState.callType === "voice" && " · 语音通话"}
          </p>
        </div>
      </div>

      {/* 视频/语音主体 */}
      <div className="flex-1 relative min-h-0">
        {callState.callType === "video" ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B141A]">
              {remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-white">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-white/20">
                    <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-3xl bg-[#2A3942]">{callState.contactName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-medium">{callState.contactName}</p>
                  <p className="text-sm text-[#8696A0]">等待视频连接...</p>
                </div>
              )}
            </div>

            {localStream && !callState.isVideoOff && (
              <div className="absolute right-4 top-4 h-36 w-28 overflow-hidden rounded-xl border border-white/20 bg-black shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            )}

            {callState.isVideoOff && (
              <div className="absolute right-4 top-4 flex h-36 w-28 items-center justify-center rounded-xl border border-white/20 bg-[#2A3942]">
                <VideoOff className="h-10 w-10 text-white/70" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Avatar className="h-32 w-32 border-2 border-white/20">
              <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-4xl bg-[#2A3942]">{callState.contactName[0]}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* 底部控制栏 - WhatsApp 风格 */}
      <div className="shrink-0 pb-10 pt-6">
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className={`${controlBtnBase} ${callState.isMuted ? controlBtnOff : ""}`}
            onClick={onToggleMute}
          >
            {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`${controlBtnBase} ${callState.isSpeakerOn ? controlBtnActive : ""}`}
            onClick={onToggleSpeaker}
          >
            {callState.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>

          {callState.callType === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className={`${controlBtnBase} ${callState.isVideoOff ? controlBtnOff : ""}`}
              onClick={onToggleVideo}
            >
              {callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white flex items-center justify-center"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
