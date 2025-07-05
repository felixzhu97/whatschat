"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Send, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"
import type { Message } from "../types"
import type { VoiceRecording } from "../hooks/use-voice-recorder"

interface MessageInputProps {
  messageText: string
  showEmojiPicker: boolean
  replyingTo: Message | null
  editingMessage: { id: string; text: string } | null
  isRecordingVoice: boolean
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onSendMessage: () => void
  onEmojiSelect: (emoji: string) => void
  onToggleEmojiPicker: () => void
  onFileSelect: (file: File, type: "image" | "file") => void
  onSendVoice: (recording: VoiceRecording) => void
  onCancelReply: () => void
  onCancelEdit: () => void
  onRecordingChange: (isRecording: boolean) => void
}

export function MessageInput({
  messageText,
  showEmojiPicker,
  replyingTo,
  editingMessage,
  isRecordingVoice,
  onMessageChange,
  onKeyPress,
  onSendMessage,
  onEmojiSelect,
  onToggleEmojiPicker,
  onFileSelect,
  onSendVoice,
  onCancelReply,
  onCancelEdit,
  onRecordingChange,
}: MessageInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [messageText])

  return (
    <div className="bg-gray-50 border-t border-gray-200">
      {/* 回复预览 */}
      {replyingTo && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">回复 {replyingTo.senderName || "对方"}</p>
            <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 编辑预览 */}
      {editingMessage && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-700">编辑消息</p>
            <p className="text-sm text-gray-600 truncate">{editingMessage.text}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2">
            <FileUpload onFileSelect={onFileSelect} />
            <Button variant="ghost" size="icon" onClick={onToggleEmojiPicker} className="relative">
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={messageText}
              onChange={onMessageChange}
              onKeyDown={onKeyPress}
              placeholder="输入消息..."
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-10">
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onEmojiSelect={onEmojiSelect}
                  onClose={() => onToggleEmojiPicker()}
                />
              </div>
            )}
          </div>

          {messageText.trim() ? (
            <Button onClick={onSendMessage} size="icon" className="bg-green-500 hover:bg-green-600">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <VoiceRecorder
              onSendVoice={onSendVoice}
              isRecording={isRecordingVoice}
              onRecordingChange={onRecordingChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
