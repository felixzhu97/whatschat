"use client"

import { Phone, PhoneOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Button } from "@/src/presentation/components/ui/button"
import type { RTCCallState } from "../../../lib/webrtc"

interface RealIncomingCallProps {
  callState: RTCCallState
  onAnswer: () => void
  onDecline: () => void
}

export function RealIncomingCall({ callState, onAnswer, onDecline }: RealIncomingCallProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        {/* 来电动画 */}
        <div className="relative mb-8">
          <Avatar className="h-32 w-32 mx-auto">
            <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-4xl">{callState.contactName[0]}</AvatarFallback>
          </Avatar>

          {/* 呼吸动画圆圈 */}
          <div className="absolute inset-0 rounded-full border-4 border-white opacity-30 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-2 border-white opacity-50 animate-ping animation-delay-300"></div>
        </div>

        <h2 className="text-2xl font-light mb-2">{callState.contactName}</h2>
        <p className="text-gray-300 mb-2">{callState.callType === "video" ? "视频通话" : "语音通话"}来电</p>
        <p className="text-gray-400 text-sm mb-12">正在响铃...</p>

        {/* 接听/拒绝按钮 */}
        <div className="flex items-center justify-center gap-16">
          {/* 拒绝按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={onDecline}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>

          {/* 接听按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white animate-pulse"
            onClick={onAnswer}
          >
            <Phone className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}
