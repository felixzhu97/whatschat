"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, MoreVertical, Phone, Video, Send, Smile, Users, UserPlus, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GroupInfoPanel } from "./group-info-panel"
import { CreateGroupDialog } from "./create-group-dialog"
import { SettingsPage } from "./settings-page"
import { ProfilePage } from "./profile-page"
import { CallsPage } from "./calls-page"
import { StatusPage } from "./status-page"
import { StarredMessagesPage } from "./starred-messages-page"
import { useChat } from "../hooks/use-chat"
import { MessageBubble } from "./message-bubble"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"
import { useCall } from "../hooks/use-call"
import { CallInterface } from "./call-interface"
import { IncomingCall } from "./incoming-call"
import { CallMiniWindow } from "./call-mini-window"
import { GroupCallInterface } from "./group-call-interface"
import { InviteParticipantsDialog } from "./invite-participants-dialog"
import { useAuth } from "../hooks/use-auth"
import type { Contact, Message } from "../types"
import type { VoiceRecording } from "../hooks/use-voice-recorder"

const contacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，今天有空吗？",
    time: "14:30",
    unread: 2,
    online: true,
  },
  {
    id: "group1",
    name: "项目讨论组",
    avatar: "/placeholder.svg?height=40&width=40&text=项目",
    lastMessage: "李四: 明天的会议改到下午3点",
    time: "15:20",
    unread: 5,
    isGroup: true,
    memberCount: 8,
    description: "项目开发讨论群组",
    admin: ["user1", "user2"],
    members: [
      { id: "user1", name: "张三", avatar: "/placeholder.svg?height=32&width=32&text=张", role: "admin" },
      { id: "user2", name: "李四", avatar: "/placeholder.svg?height=32&width=32&text=李", role: "admin" },
      { id: "user3", name: "王五", avatar: "/placeholder.svg?height=32&width=32&text=王", role: "member" },
      { id: "user4", name: "赵六", avatar: "/placeholder.svg?height=32&width=32&text=赵", role: "member" },
    ],
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "好的，明天见！",
    time: "12:15",
  },
]

export function WhatsAppMain() {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messageText, setMessageText] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [callMinimized, setCallMinimized] = useState(false)
  const [currentPage, setCurrentPage] = useState<"chat" | "settings" | "profile" | "calls" | "status" | "starred">(
    "chat",
  )
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const { messages, isTyping, sendMessage, startTyping, stopTyping, deleteMessage, editMessage } = useChat(
    selectedContact.id,
  )

  const {
    callState,
    localStream,
    remoteStream,
    startCall,
    startGroupCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    simulateIncomingCall,
    formatDuration,
    inviteParticipant,
    removeParticipant,
    toggleParticipantMute,
  } = useCall()

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 模拟来电（演示用）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!callState.isActive && Math.random() > 0.7) {
        simulateIncomingCall("2", "李四", "/placeholder.svg?height=40&width=40&text=李", "voice")
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [callState.isActive, simulateIncomingCall])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value)
    if (e.target.value.trim()) {
      startTyping()
    } else {
      stopTyping()
    }
  }

  // 发送消息
  const handleSendMessage = () => {
    if (!messageText.trim()) return

    if (editingMessage) {
      editMessage(editingMessage.id, messageText)
      setEditingMessage(null)
    } else {
      sendMessage(messageText, "text")
    }

    setMessageText("")
    setReplyingTo(null)
    stopTyping()
    inputRef.current?.focus()
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 处理表情符号选择
  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  // 处理文件上传
  const handleFileSelect = (file: File, type: "image" | "file") => {
    const fileData = {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileUrl: URL.createObjectURL(file),
    }

    sendMessage(type === "image" ? "" : file.name, type, fileData)
  }

  // 处理语音消息发送
  const handleSendVoice = (recording: VoiceRecording) => {
    const voiceData = {
      fileUrl: recording.url,
      duration: recording.duration,
    }

    sendMessage("", "voice", voiceData)
    setIsRecordingVoice(false)
  }

  // 处理消息回复
  const handleReply = (message: Message) => {
    setReplyingTo(message)
    inputRef.current?.focus()
  }

  // 处理消息编辑
  const handleEdit = (messageId: string, text: string) => {
    setEditingMessage({ id: messageId, text })
    setMessageText(text)
    inputRef.current?.focus()
  }

  // 发起群组通话
  const handleGroupCall = (callType: "voice" | "video") => {
    if (selectedContact.isGroup && selectedContact.members) {
      const participants = selectedContact.members.map((member) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        isMuted: false,
        isVideoOff: callType === "voice",
        isSpeaking: false,
        isHost: member.role === "admin",
        joinedAt: 0,
      }))

      startGroupCall(selectedContact.id, selectedContact.name, selectedContact.avatar, callType, participants)
    }
  }

  // 邀请参与者
  const handleInviteParticipants = (newParticipants: any[]) => {
    newParticipants.forEach((participant) => {
      inviteParticipant(participant)
    })
  }

  // 打开邀请对话框
  const handleOpenInviteDialog = () => {
    setShowInviteDialog(true)
  }

  // 发起语音通话
  const handleVoiceCall = () => {
    if (selectedContact.isGroup) {
      handleGroupCall("voice")
    } else {
      startCall(selectedContact.id, selectedContact.name, selectedContact.avatar, "voice")
    }
  }

  // 发起视频通话
  const handleVideoCall = () => {
    if (selectedContact.isGroup) {
      handleGroupCall("video")
    } else {
      startCall(selectedContact.id, selectedContact.name, selectedContact.avatar, "video")
    }
  }

  // 接听来电
  const handleAnswerCall = () => {
    answerCall()
  }

  // 拒绝来电
  const handleDeclineCall = () => {
    endCall()
  }

  // 最小化通话
  const handleMinimizeCall = () => {
    setCallMinimized(true)
  }

  // 最大化通话
  const handleMaximizeCall = () => {
    setCallMinimized(false)
  }

  if (currentPage !== "chat") {
    return (
      <div className="h-screen">
        {currentPage === "settings" && (
          <SettingsPage onBack={() => setCurrentPage("chat")} onProfileClick={() => setCurrentPage("profile")} />
        )}
        {currentPage === "profile" && <ProfilePage onBack={() => setCurrentPage("settings")} />}
        {currentPage === "calls" && <CallsPage onBack={() => setCurrentPage("chat")} />}
        {currentPage === "status" && <StatusPage onBack={() => setCurrentPage("chat")} />}
        {currentPage === "starred" && <StarredMessagesPage onBack={() => setCurrentPage("chat")} />}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&text=我"} />
              <AvatarFallback>{user?.name?.[0] || "我"}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("status")}>
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("calls")}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCreateGroup(true)}>
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("settings")}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="搜索或开始新聊天" className="pl-10 bg-gray-100 border-none" />
          </div>
        </div>

        {/* 联系人列表 */}
        <ScrollArea className="flex-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedContact.id === contact.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                    {contact.isGroup && <Users className="h-3 w-3 text-gray-500" />}
                  </div>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  <div className="flex items-center gap-1">
                    {contact.isGroup && contact.memberCount && (
                      <span className="text-xs text-gray-400">{contact.memberCount}人</span>
                    )}
                    {contact.unread && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => selectedContact.isGroup && setShowGroupInfo(true)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-medium">{selectedContact.name}</h2>
                {selectedContact.isGroup && <Users className="h-4 w-4 text-gray-500" />}
              </div>
              <p className="text-sm text-gray-500">
                {isTyping ? (
                  <span className="text-green-600">正在输入...</span>
                ) : selectedContact.isGroup ? (
                  `${selectedContact.memberCount} 位成员`
                ) : selectedContact.online ? (
                  "在线"
                ) : (
                  "上次在线时间：今天 14:30"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleVoiceCall} disabled={callState.isActive}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleVideoCall} disabled={callState.isActive}>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage("starred")}>
              <Star className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 消息区域 */}
        <ScrollArea
          className="flex-1 p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: "#efeae2",
          }}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isGroup={selectedContact.isGroup}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={deleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 回复预览 */}
        {replyingTo && (
          <div className="bg-gray-100 p-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600">回复 {replyingTo.senderName || "对方"}</p>
              <p className="text-sm text-gray-600 truncate">{replyingTo.text}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              ✕
            </Button>
          </div>
        )}

        {/* 编辑预览 */}
        {editingMessage && (
          <div className="bg-blue-100 p-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-600">编辑消息</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingMessage(null)
                setMessageText("")
              }}
            >
              ✕
            </Button>
          </div>
        )}

        {/* 输入区域 */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 relative">
          {isRecordingVoice ? (
            <VoiceRecorder onSendVoice={handleSendVoice} onCancel={() => setIsRecordingVoice(false)} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="h-5 w-5" />
              </Button>

              <FileUpload onFileSelect={handleFileSelect} />

              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={editingMessage ? "编辑消息..." : "输入消息"}
                  className="pr-12 bg-white"
                />
              </div>

              {messageText.trim() ? (
                <Button size="icon" className="bg-green-500 hover:bg-green-600" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <VoiceRecorder onSendVoice={handleSendVoice} onCancel={() => setIsRecordingVoice(false)} />
              )}
            </div>
          )}

          {/* 表情符号选择器 */}
          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={handleEmojiSelect}
          />
        </div>
      </div>

      {/* 通话界面 */}
      {callState.isActive && callState.status === "ringing" && (
        <IncomingCall callState={callState} onAnswer={handleAnswerCall} onDecline={handleDeclineCall} />
      )}

      {callState.isActive && callState.status !== "ringing" && !callMinimized && (
        <>
          {callState.isGroupCall ? (
            <GroupCallInterface
              callState={callState}
              localStream={localStream}
              onEndCall={endCall}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
              onToggleSpeaker={toggleSpeaker}
              onInviteParticipant={handleOpenInviteDialog}
              onRemoveParticipant={removeParticipant}
              onToggleParticipantMute={toggleParticipantMute}
              onMinimize={handleMinimizeCall}
              formatDuration={formatDuration}
            />
          ) : (
            <CallInterface
              callState={callState}
              localStream={localStream}
              remoteStream={remoteStream}
              onEndCall={endCall}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
              onToggleSpeaker={toggleSpeaker}
              onMinimize={handleMinimizeCall}
              formatDuration={formatDuration}
            />
          )}
        </>
      )}

      {/* 小窗口通话 */}
      {callState.isActive && callState.status === "connected" && callMinimized && (
        <CallMiniWindow
          callState={callState}
          localStream={localStream}
          onEndCall={endCall}
          onMaximize={handleMaximizeCall}
          formatDuration={formatDuration}
        />
      )}

      {/* 群组信息面板 */}
      {selectedContact.isGroup && (
        <GroupInfoPanel
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          groupName={selectedContact.name}
          groupAvatar={selectedContact.avatar}
          groupDescription={selectedContact.description || ""}
          members={selectedContact.members || []}
          memberCount={selectedContact.memberCount || 0}
          isAdmin={true}
        />
      )}

      {/* 创建群组对话框 */}
      <CreateGroupDialog
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        contacts={[]}
        onCreateGroup={(name, members) => {
          console.log("创建群组:", name, members)
        }}
      />

      {/* 邀请参与者对话框 */}
      <InviteParticipantsDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        currentParticipants={callState.participants}
        onInvite={handleInviteParticipants}
      />
    </div>
  )
}
