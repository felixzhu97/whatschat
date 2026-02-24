"use client"

import { Phone, PhoneOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Button } from "@/src/presentation/components/ui/button"
import type { RTCCallState } from "@/src/lib/webrtc"

interface RealIncomingCallProps {
  callState: RTCCallState
  onAnswer: () => void
  onDecline: () => void
}

export function RealIncomingCall({ callState, onAnswer, onDecline }: RealIncomingCallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B141A]">
      <div className="flex flex-col items-center text-white">
        <div className="relative mb-6">
          <Avatar className="h-28 w-28 border-2 border-white/20">
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-3xl bg-[#2A3942]">{callState.contactName[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute -inset-1 rounded-full border-2 border-[#25D366]/40 animate-ping" />
        </div>

        <h2 className="text-xl font-medium mb-1">{callState.contactName}</h2>
        <p className="text-[#8696A0] text-sm mb-10">
          {callState.callType === "video" ? "视频通话" : "语音通话"} · 正在响铃...
        </p>

        <div className="flex items-center justify-center gap-12">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-[#E53935] hover:bg-[#D32F2F] text-white flex items-center justify-center"
            onClick={onDecline}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#20BD5C] text-white flex items-center justify-center animate-pulse"
            onClick={onAnswer}
          >
            <Phone className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}
