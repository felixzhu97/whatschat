"use client"

import { useEffect, useRef } from "react"
import { MessageBubble } from "./message-bubble"
import type { Contact, Message } from "../types"

interface MessageAreaProps {
  messages: Message[]
  selectedContact: Contact | null
  isGroup?: boolean
  onReply: (message: Message) => void
  onEdit: (messageId: string, text: string) => void
  onDelete: (messageId: string) => void
  onForward: (message: Message) => void
  onStar: (messageId: string) => void
  onInfo: (message: Message) => void
}

export function MessageArea({
  messages,
  selectedContact,
  isGroup = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">选择一个联系人开始聊天</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">还没有消息，开始聊天吧！</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isGroup={isGroup}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onForward={onForward}
            onStar={onStar}
            onInfo={onInfo}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
