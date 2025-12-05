"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/src/presentation/components/ui/button"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { Smile, Paperclip, Send, X } from "lucide-react"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"
import type { Message } from "../../../types"

interface MessageInputProps {
  messageText: string
  showEmojiPicker: boolean
  replyingTo: Message | null
  editingMessage: Message | null
  isRecordingVoice: boolean
  onMessageChange: (text: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onSendMessage: () => void
  onEmojiSelect: (emoji: string) => void
  onToggleEmojiPicker: () => void
  onFileSelect: (file: File) => void
  onSendVoice: (audioBlob: Blob, duration: number) => void
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
  const [showFileUpload, setShowFileUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage()
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleFileUpload = (file: File, type: "image" | "file") => {
    onFileSelect(file)
    setShowFileUpload(false)
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Reply/Edit indicator */}
      {(replyingTo || editingMessage) && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {editingMessage ? "编辑消息" : `回复 ${replyingTo?.senderName}`}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {editingMessage ? editingMessage.content : replyingTo?.content}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={editingMessage ? onCancelEdit : onCancelReply}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Emoji Picker Button */}
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={onToggleEmojiPicker} className="text-gray-500 hover:text-gray-700">
            <Smile className="h-5 w-5" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker isOpen={showEmojiPicker} onClose={onToggleEmojiPicker} onEmojiSelect={onEmojiSelect} />
            </div>
          )}
        </div>

        {/* File Upload Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          {showFileUpload && (
            <div className="absolute bottom-12 left-0 z-50">
              <FileUpload onFileSelect={handleFileUpload} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="输入消息..."
            className="min-h-[40px] max-h-32 resize-none border-gray-300 focus:border-green-500 focus:ring-green-500"
            rows={1}
          />
        </div>

        {/* Voice/Send Button */}
        {messageText.trim() ? (
          <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600 text-white" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <VoiceRecorder onSendVoice={onSendVoice} onRecordingChange={onRecordingChange} />
        )}
      </div>
    </div>
  )
}
