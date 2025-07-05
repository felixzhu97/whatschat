"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Reply, Edit, Trash, Copy, Forward, Star, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Message } from "../types"
import { VoiceMessagePlayer } from "./voice-message-player"
import { useLongPress } from "../hooks/use-long-press"

interface MessageBubbleProps {
  message: Message
  isGroup?: boolean
  onReply?: (message: Message) => void
  onEdit?: (messageId: string, newText: string) => void
  onDelete?: (messageId: string) => void
  onForward?: (message: Message) => void
  onStar?: (messageId: string) => void
}

export function MessageBubble({ message, isGroup, onReply, onEdit, onDelete, onForward, onStar }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [showActions, setShowActions] = useState(false)
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 })
  const editInputRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const actionsTimeoutRef = useRef<NodeJS.Timeout>()

  // 长按检测
  const longPressEvents = useLongPress({
    onLongPress: () => {
      setShowActions(true)
      // 添加触觉反馈（如果支持）
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }
    },
    delay: 500, // 500ms 长按
  })

  // 处理点击外部关闭操作菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchstart", handleClickOutside)
      }
    }
  }, [showActions])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (actionsTimeoutRef.current) {
        clearTimeout(actionsTimeoutRef.current)
      }
    }
  }, [])

  // 当菜单关闭时，也隐藏操作按钮
  useEffect(() => {
    if (!showMenu && !showActions) {
      setShowActions(false)
    }
  }, [showMenu, showActions])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setShowMenu(false)
    setShowActions(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
    setShowActions(false)
    setTimeout(() => editInputRef.current?.focus(), 100)
  }

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit?.(message.id, editText.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(message.text)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement("a")
      link.href = message.fileUrl
      link.download = message.fileName || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    setShowMenu(false)
    setShowActions(false)
  }

  const handleQuickAction = (action: () => void) => {
    action()
    setShowActions(false)
  }

  const getMessageStatus = () => {
    if (!message.sent) return null

    if (message.read) {
      return <span className="text-blue-200 text-xs">✓✓</span>
    } else if (message.delivered) {
      return <span className="text-green-200 text-xs">✓✓</span>
    } else {
      return <span className="text-green-300 text-xs">✓</span>
    }
  }

  const formatTime = (timeString: string) => {
    const messageDate = new Date()
    const today = new Date()

    if (messageDate.toDateString() === today.toDateString()) {
      return timeString
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `昨天 ${timeString}`
    }

    return `${messageDate.getMonth() + 1}/${messageDate.getDate()} ${timeString}`
  }

  return (
    <div ref={messageRef} className={`flex ${message.sent ? "justify-end" : "justify-start"} group relative`}>
      {/* 快速回复按钮 - 左侧消息 */}
      {showActions && !message.sent && (
        <div className="flex items-center mr-2 animate-in slide-in-from-left-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white shadow-md hover:bg-gray-50 border"
            onClick={() => handleQuickAction(() => onReply?.(message))}
          >
            <Reply className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 relative transition-all duration-200 select-none ${
          message.sent
            ? "bg-green-500 text-white rounded-br-sm"
            : "bg-white text-gray-900 shadow-sm border rounded-bl-sm"
        } ${showActions ? "shadow-lg scale-[1.02]" : ""} ${longPressEvents.isLongPressing ? "scale-95" : ""}`}
        {...longPressEvents}
      >
        {/* 群组消息发送者 */}
        {!message.sent && isGroup && message.senderName && (
          <p className="text-xs font-medium text-green-600 mb-1">{message.senderName}</p>
        )}

        {/* 回复消息预览 */}
        {message.replyTo && (
          <div
            className={`rounded p-2 mb-2 text-xs border-l-2 ${
              message.sent ? "bg-green-600 border-green-300" : "bg-gray-100 border-green-500"
            }`}
          >
            <p className="opacity-70 font-medium">回复消息</p>
            <p className="opacity-90 truncate">原消息内容...</p>
          </div>
        )}

        {/* 消息内容 */}
        {message.type === "text" &&
          (isEditing ? (
            <div className="space-y-2">
              <Input
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm bg-transparent border-white/20 text-white placeholder:text-white/70"
                placeholder="编辑消息..."
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleSaveEdit}>
                  保存
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          ))}

        {message.type === "image" && (
          <div className="space-y-2">
            <div className="relative group/image">
              <img
                src={message.fileUrl || "/placeholder.svg?height=200&width=300&text=图片"}
                alt="发送的图片"
                className="rounded max-w-full h-auto cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  window.open(message.fileUrl, "_blank")
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors rounded flex items-center justify-center">
                <Download className="h-6 w-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
              </div>
            </div>
            {message.text && <p className="text-sm">{message.text}</p>}
          </div>
        )}

        {message.type === "file" && (
          <div
            className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
              message.sent ? "bg-green-600 hover:bg-green-700" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={handleDownload}
          >
            <div
              className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium ${
                message.sent ? "bg-green-700 text-white" : "bg-gray-300 text-gray-700"
              }`}
            >
              📄
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs opacity-70">{message.fileSize}</p>
            </div>
            <Download className="h-4 w-4 opacity-70" />
          </div>
        )}

        {message.type === "voice" && (
          <VoiceMessagePlayer audioUrl={message.fileUrl!} duration={message.duration || 0} sent={message.sent} />
        )}

        {/* 时间、状态和星标 */}
        <div
          className={`flex items-center justify-between gap-2 mt-1 ${
            message.sent ? "text-green-100" : "text-gray-500"
          }`}
        >
          <div className="flex items-center gap-1">
            {message.edited && <span className="text-xs opacity-70">已编辑</span>}
            <span className="text-xs">{formatTime(message.time)}</span>
          </div>
          <div className="flex items-center gap-1">
            {message.starred && <Star className="h-3 w-3 fill-current text-yellow-400" />}
            {getMessageStatus()}
          </div>
        </div>

        {/* 长按提示 */}
        {longPressEvents.isLongPressing && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 animate-in fade-in-0 duration-200">
            松开显示选项
          </div>
        )}

        {/* 消息操作菜单 - 改进的位置和样式 */}
        {showActions && (
          <div className={`absolute -top-12 ${message.sent ? "right-0" : "left-0"} z-10`}>
            <div className="bg-white rounded-lg shadow-lg border p-1 flex items-center gap-1 animate-in slide-in-from-top-2 duration-200">
              {/* 快速操作按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
                onClick={() => handleQuickAction(() => onReply?.(message))}
                title="回复"
              >
                <Reply className="h-4 w-4" />
              </Button>

              {message.sent && message.type === "text" && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                  onClick={handleEdit}
                  title="编辑"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
                onClick={() => handleQuickAction(() => onStar?.(message.id))}
                title={message.starred ? "取消星标" : "加星标"}
              >
                <Star className={`h-4 w-4 ${message.starred ? "fill-current text-yellow-400" : ""}`} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
                onClick={() => handleQuickAction(() => onForward?.(message))}
                title="转发"
              >
                <Forward className="h-4 w-4" />
              </Button>

              {/* 更多选项菜单 */}
              <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" title="更多选项">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={message.sent ? "end" : "start"} className="w-48">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    复制
                  </DropdownMenuItem>
                  {(message.type === "file" || message.type === "image") && (
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      下载
                    </DropdownMenuItem>
                  )}
                  {message.sent && (
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete?.(message.id)
                        setShowActions(false)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 关闭按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100 ml-1 border-l"
                onClick={() => setShowActions(false)}
                title="关闭"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 快速操作按钮 - 右侧消息 */}
      {showActions && message.sent && (
        <div className="flex items-center ml-2 animate-in slide-in-from-right-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white shadow-md hover:bg-gray-50 border"
            onClick={() => handleQuickAction(() => onForward?.(message))}
          >
            <Forward className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
