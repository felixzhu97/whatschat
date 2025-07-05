"use client"

import { useState } from "react"
import { MoreVertical, Reply, Edit, Trash, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Message } from "../types"
import { VoiceMessagePlayer } from "./voice-message-player"

interface MessageBubbleProps {
  message: Message
  isGroup?: boolean
  onReply?: (message: Message) => void
  onEdit?: (messageId: string, newText: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({ message, isGroup, onReply, onEdit, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
  }

  const getMessageStatus = () => {
    if (!message.sent) return null

    if (message.read) {
      return <span className="text-blue-200">✓✓</span>
    } else if (message.delivered) {
      return <span className="text-green-200">✓✓</span>
    } else {
      return <span className="text-green-300">✓</span>
    }
  }

  return (
    <div className={`flex ${message.sent ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 relative ${
          message.sent ? "bg-green-500 text-white" : "bg-white text-gray-900 shadow-sm"
        }`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* 群组消息发送者 */}
        {!message.sent && isGroup && message.senderName && (
          <p className="text-xs font-medium text-green-600 mb-1">{message.senderName}</p>
        )}

        {/* 回复消息 */}
        {message.replyTo && (
          <div className="bg-black bg-opacity-10 rounded p-2 mb-2 text-xs">
            <p className="opacity-70">回复消息</p>
          </div>
        )}

        {/* 消息内容 */}
        {message.type === "text" && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}

        {message.type === "image" && (
          <div className="space-y-2">
            <img
              src={message.fileUrl || "/placeholder.svg?height=200&width=300&text=图片"}
              alt="发送的图片"
              className="rounded max-w-full h-auto"
            />
            {message.text && <p className="text-sm">{message.text}</p>}
          </div>
        )}

        {message.type === "file" && (
          <div className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded">
            <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-xs">📄</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs opacity-70">{message.fileSize}</p>
            </div>
          </div>
        )}

        {message.type === "voice" && (
          <VoiceMessagePlayer audioUrl={message.fileUrl!} duration={message.duration || 0} sent={message.sent} />
        )}

        {/* 时间和状态 */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${message.sent ? "text-green-100" : "text-gray-500"}`}
        >
          {message.edited && <span className="text-xs opacity-70">已编辑</span>}
          <span className="text-xs">{message.time}</span>
          {getMessageStatus()}
        </div>

        {/* 消息菜单 */}
        {showMenu && (
          <div className="absolute -top-8 right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  回复
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </DropdownMenuItem>
                {message.sent && message.type === "text" && (
                  <DropdownMenuItem onClick={() => onEdit?.(message.id, message.text)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                )}
                {message.sent && (
                  <DropdownMenuItem onClick={() => onDelete?.(message.id)} className="text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}
