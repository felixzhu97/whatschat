"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import type { Message, Contact } from "../types"

interface MessageAreaProps {
  messages: Message[]
  selectedContact: Contact
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
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isGroup =
    selectedContact.id === "group1" || selectedContact.name.includes("群") || selectedContact.name.includes("组")

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {(messages || []).map((message) => (
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
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
