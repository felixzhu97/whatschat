"use client"

import { Users } from "lucide-react"

export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 rounded-full flex items-center justify-center">
          <Users className="w-24 h-24 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">欢迎使用 WhatsApp Web</h2>
        <p className="text-gray-500 mb-4">发送和接收消息，无需保持手机在线。</p>
        <p className="text-sm text-gray-400">选择一个聊天开始对话</p>
      </div>
    </div>
  )
}
