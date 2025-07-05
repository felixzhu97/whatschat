"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneOff, MessageSquare, Mic, MicOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { CallState } from "../types"

interface IncomingCallProps {
  callState: CallState
  onAnswer: () => void
  onDecline: () => void
  onQuickReply: (message: string) => void
}

export function IncomingCall({ callState, onAnswer, onDecline, onQuickReply }: IncomingCallProps) {
  const [showQuickReply, setShowQuickReply] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(true)

  const quickReplyMessages = ["我现在不方便接电话", "稍后回电给你", "正在开会，稍后联系", "我在路上，等会儿打给你"]

  // 脉冲动画效果
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation((prev) => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!callState.isActive || callState.status !== "ringing") {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* 来电信息 */}
      <div className="relative z-10 text-center mb-12">
        <div className="mb-6">
          <div className={`relative inline-block ${pulseAnimation ? "animate-pulse" : ""}`}>
            <Avatar className="w-32 h-32 border-4 border-white/30">
              <AvatarImage src={callState.contactAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-4xl bg-gray-600 text-white">{callState.contactName[0]}</AvatarFallback>
            </Avatar>
            {/* 呼叫动画环 */}
            <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping delay-75"></div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{callState.contactName}</h2>
        <p className="text-xl text-white/80 mb-1">{callState.callType === "video" ? "视频通话" : "语音通话"}来电</p>
        <p className="text-lg text-white/60">正在呼叫中...</p>
      </div>

      {/* 快速回复 */}
      {showQuickReply && (
        <div className="relative z-10 mb-8 w-full max-w-md px-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 space-y-2">
            <h3 className="text-white text-sm font-medium mb-3">快速回复</h3>
            {quickReplyMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => {
                  onQuickReply(message)
                  setShowQuickReply(false)
                }}
                className="w-full text-left p-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                {message}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="relative z-10 flex items-center justify-center gap-8">
        {/* 快速回复按钮 */}
        <Button
          variant="secondary"
          size="icon"
          className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
          onClick={() => setShowQuickReply(!showQuickReply)}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </Button>

        {/* 拒绝按钮 */}
        <Button
          variant="destructive"
          size="icon"
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-2xl hover:scale-110 transition-transform"
          onClick={onDecline}
        >
          <PhoneOff className="w-8 h-8" />
        </Button>

        {/* 接听按钮 */}
        <Button
          variant="default"
          size="icon"
          className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl hover:scale-110 transition-transform"
          onClick={onAnswer}
        >
          <Phone className="w-8 h-8" />
        </Button>

        {/* 静音按钮 */}
        <Button
          variant="secondary"
          size="icon"
          className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
          onClick={() => {
            // 切换静音状态
          }}
        >
          {callState.isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/60 text-sm">向上滑动查看更多选项</p>
      </div>
    </div>
  )
}
