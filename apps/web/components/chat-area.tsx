"use client";

import type React from "react";

import { ChatHeader } from "./chat-header";
import { MessageArea } from "./message-area";
import { MessageInput } from "./message-input";
import type { Contact, Message } from "../types";

interface ChatAreaProps {
  selectedContact: Contact;
  messages: Message[];
  messageText: string;
  showEmojiPicker: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  isRecordingVoice: boolean;
  isTyping: boolean;
  isConnected: boolean;
  onMessageChange: (text: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: (
    content: string,
    type?: "text" | "image" | "video" | "audio" | "file"
  ) => void;
  onEmojiSelect: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (file: File) => void;
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onForward: (message: Message) => void;
  onStar: (message: Message) => void;
  onInfo: (message: Message) => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onShowInfo: () => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onRecordingChange: (isRecording: boolean) => void;
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
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader
        contact={selectedContact}
        isTyping={isTyping}
        isGroup={selectedContact.isGroup}
        onVoiceCall={onVoiceCall}
        onVideoCall={onVideoCall}
        onShowInfo={onShowInfo}
      />

      {/* Messages Area */}
      <MessageArea
        messages={messages}
        selectedContact={selectedContact}
        isGroup={selectedContact.isGroup}
        onReply={onReply}
        onEdit={(messageId: string, text: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onEdit({ ...message, content: text });
          }
        }}
        onDelete={(messageId: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onDelete(message);
          }
        }}
        onForward={onForward}
        onStar={(messageId: string) => {
          const message = messages.find((m) => m.id === messageId);
          if (message) {
            onStar(message);
          }
        }}
        onInfo={onInfo}
      />

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {selectedContact.name} 正在输入...
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        messageText={messageText}
        showEmojiPicker={showEmojiPicker}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        isRecordingVoice={isRecordingVoice}
        onMessageChange={onMessageChange}
        onKeyPress={onKeyPress}
        onSendMessage={() => onSendMessage(messageText)}
        onEmojiSelect={onEmojiSelect}
        onToggleEmojiPicker={onToggleEmojiPicker}
        onFileSelect={onFileSelect}
        onSendVoice={onSendVoice}
        onCancelReply={onCancelReply}
        onCancelEdit={onCancelEdit}
        onRecordingChange={onRecordingChange}
      />
    </div>
  );
}
