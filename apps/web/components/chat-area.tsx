"use client"

import type React from "react"

import { WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatHeader } from "./chat-header"
import { MessageArea } from "./message-area"
import { MessageInput } from "./message-input"
import { WelcomeScreen } from "./welcome-screen"
import type { Contact, Message } from "../types"
import type { VoiceRecording } from "../hooks/use-voice-recorder"

interface ChatAreaProps {
  selectedContact: Contact | null
  messages: Message[]
  messageText: string
  showEmojiPicker: boolean
  replyingTo: Message | null
  editingMessage: { id: string; text: string } | null
  isRecordingVoice: boolean
  isTyping: boolean
  isConnected: boolean
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onSendMessage: () => void
  onEmojiSelect: (emoji: string) => void
  onToggleEmojiPicker: () => void
  onFileSelect: (file: File, type: "image" | "file") => void
  onSendVoice: (recording: VoiceRecording) => void
  onReply: (message: Message) => void
  onEdit: (messageId: string, text: string) => void
  onDelete: (messageId: string) => void
  onForward: (message: Message) => void
  onStar: (messageId: string) => void
  onInfo: (message: Message) => void
  onVoiceCall: () => void
  onVideoCall: () => void
  onShowInfo: () => void
  onCancelReply: () => void
  onCancelEdit: () => void
  onRecordingChange: (isRecording: boolean) => void
}

export function ChatArea({
  selectedContact,
  messages,
  messageText,
  showEmojiPicker,
  replyingTo,
  editingMessage,
  isRecordingVoice,
  isTyping,
  isConnected,
  onMessageChange,
  onKeyPress,
  onSendMessage,
  onEmojiSelect,
  onToggleEmojiPicker,
  onFileSelect,
  onSendVoice,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
  onVoiceCall,
  onVideoCall,
  onShowInfo,
  onCancelReply,
  onCancelEdit,
  onRecordingChange,
}: ChatAreaProps) {
  if (!selectedContact) {
    return <WelcomeScreen />
  }

  const isGroup =
    selectedContact.id === "group1" || selectedContact.name.includes("群") || selectedContact.name.includes("组")

  return (
    <div className="flex-1 flex flex-col">
      {/* 聊天头部 */}
      <ChatHeader
        contact={selectedContact}
        isTyping={isTyping}
        isGroup={isGroup}
        onVoiceCall={onVoiceCall}
        onVideoCall={onVideoCall}
        onShowInfo={onShowInfo}
      />

      {/* 连接状态提示 */}
      {!isConnected && (
        <Alert className="m-4 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>连接已断开，正在重新连接...</AlertDescription>
        </Alert>
      )}

      {/* 消息区域 */}
      <MessageArea
        messages={messages}
        selectedContact={selectedContact}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onForward={onForward}
        onStar={onStar}
        onInfo={onInfo}
      />

      {/* 输入区域 */}
      <MessageInput
        messageText={messageText}
        showEmojiPicker={showEmojiPicker}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        isRecordingVoice={isRecordingVoice}
        onMessageChange={onMessageChange}
        onKeyPress={onKeyPress}
        onSendMessage={onSendMessage}
        onEmojiSelect={onEmojiSelect}
        onToggleEmojiPicker={onToggleEmojiPicker}
        onFileSelect={onFileSelect}
        onSendVoice={onSendVoice}
        onCancelReply={onCancelReply}
        onCancelEdit={onCancelEdit}
        onRecordingChange={onRecordingChange}
      />
    </div>
  )
}
