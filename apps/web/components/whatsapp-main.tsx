"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Smile,
  Users,
  UserPlus,
  Star,
  Wifi,
  WifiOff,
  Settings,
  Archive,
  MessageSquare,
  Bell,
  BellOff,
  Trash2,
  X,
  Filter,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GroupInfoPanel } from "./group-info-panel"
import { CreateGroupDialog } from "./create-group-dialog"
import { SettingsPage } from "./settings-page"
import { ProfilePage } from "./profile-page"
import { CallsPage } from "./calls-page"
import { StatusPage } from "./status-page"
import { StarredMessagesPage } from "./starred-messages-page"
import { useRealChat } from "../hooks/use-real-chat"
import { useRealCall } from "../hooks/use-real-call"
import { MessageBubble } from "./message-bubble"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"
import { RealCallInterface } from "./real-call-interface"
import { RealIncomingCall } from "./real-incoming-call"
import { useAuth } from "../hooks/use-auth"
import type { Contact, Message } from "../types"
import type { VoiceRecording } from "../hooks/use-voice-recorder"
import { MessageSearchPage } from "./message-search-page"
import { SearchSuggestions } from "./search-suggestions"
import { AdvancedSearchDialog } from "./advanced-search-dialog"
import { ContactListItem } from "./contact-list-item"
import { SearchShortcuts } from "./search-shortcuts"
import { LongPressGuide } from "./long-press-guide"
import { HapticFeedback } from "../lib/haptic-feedback"

const contacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，今天有空吗？",
    time: "14:30",
    unread: 2,
    online: true,
    pinned: true,
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
    muted: false,
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "好的，明天见！",
    time: "12:15",
    muted: true,
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [showMessageActions, setShowMessageActions] = useState(false)
  const [currentPage, setCurrentPage] = useState<"chat" | "settings" | "profile" | "calls" | "status" | "starred">(
    "chat",
  )

  const [showSearchPage, setShowSearchPage] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(
    JSON.parse(localStorage.getItem("recentSearches") || "[]"),
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()

  // 使用实时聊天 Hook
  const { messages, isTyping, isConnected, sendMessage, startTyping, stopTyping, deleteMessage, editMessage } =
    useRealChat(selectedContact.id)

  // 使用实时通话 Hook
  const {
    callState,
    localStream,
    remoteStream,
    error: callError,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
  } = useRealCall()

  // 过滤联系人
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [messageText])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    if (e.target.value.trim()) {
      startTyping()
    } else {
      stopTyping()
    }
  }

  // 发送消息
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return

    if (editingMessage) {
      editMessage(editingMessage.id, messageText)
      setEditingMessage(null)
    } else {
      sendMessage(messageText, "text", undefined, undefined, replyingTo?.id)
    }

    setMessageText("")
    setReplyingTo(null)
    stopTyping()
    inputRef.current?.focus()

    // 发送成功的触觉反馈
    HapticFeedback.light()
  }, [messageText, editingMessage, replyingTo, editMessage, sendMessage, stopTyping])

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
    HapticFeedback.selection()
  }

  // 处理文件上传
  const handleFileSelect = (file: File, type: "image" | "file") => {
    const fileData = {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileUrl: URL.createObjectURL(file),
    }

    sendMessage(type === "image" ? "" : file.name, type, fileData)
    HapticFeedback.light()
  }

  // 处理语音消息发送
  const handleSendVoice = (recording: VoiceRecording) => {
    const voiceData = {
      fileUrl: recording.url,
      duration: recording.duration,
    }

    sendMessage("", "voice", voiceData)
    setIsRecordingVoice(false)
    HapticFeedback.success()
  }

  // 处理消息回复
  const handleReply = (message: Message) => {
    setReplyingTo(message)
    inputRef.current?.focus()
    HapticFeedback.light()
  }

  // 处理消息编辑
  const handleEdit = (messageId: string, text: string) => {
    setEditingMessage({ id: messageId, text })
    setMessageText(text)
    inputRef.current?.focus()
    HapticFeedback.light()
  }

  // 处理消息转发
  const handleForward = (message: Message) => {
    console.log("转发消息:", message)
    HapticFeedback.light()
  }

  // 处理消息星标
  const handleStar = (messageId: string) => {
    console.log("星标消息:", messageId)
    HapticFeedback.light()
  }

  // 发起语音通话
  const handleVoiceCall = async () => {
    try {
      await startCall(selectedContact.id, selectedContact.name, selectedContact.avatar, "voice")
      HapticFeedback.light()
    } catch (error) {
      console.error("发起语音通话失败:", error)
      HapticFeedback.error()
    }
  }

  // 发起视频通话
  const handleVideoCall = async () => {
    try {
      await startCall(selectedContact.id, selectedContact.name, selectedContact.avatar, "video")
      HapticFeedback.light()
    } catch (error) {
      console.error("发起视频通话失败:", error)
      HapticFeedback.error()
    }
  }

  // 处理联系人操作
  const handleContactAction = (action: string, contact: Contact) => {
    switch (action) {
      case "pin":
        console.log("置顶聊天:", contact.name)
        HapticFeedback.light()
        break
      case "mute":
        console.log("静音聊天:", contact.name)
        HapticFeedback.light()
        break
      case "archive":
        console.log("归档聊天:", contact.name)
        HapticFeedback.light()
        break
      case "delete":
        console.log("删除聊天:", contact.name)
        HapticFeedback.medium()
        break
    }
  }

  // 处理全局搜索
  const handleGlobalSearch = (query: string) => {
    if (!query.trim()) return

    // 添加到最近搜索
    const updatedSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))

    setShowSearchPage(true)
    setSearchQuery(query)
    setShowSearchSuggestions(false)
    HapticFeedback.light()
  }

  // 处理搜索建议选择
  const handleSearchSuggestion = (suggestion: any) => {
    if (suggestion.type === "contact") {
      const contact = contacts.find((c) => c.id === suggestion.id.replace("contact-", ""))
      if (contact) {
        setSelectedContact(contact)
        HapticFeedback.selection()
      }
    } else if (suggestion.type === "recent" || suggestion.type === "command") {
      handleGlobalSearch(suggestion.title)
    }
    setShowSearchSuggestions(false)
  }

  // 移除单个搜索记录
  const handleRemoveRecentSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((s) => s !== search)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    HapticFeedback.light()
  }

  // 获取所有消息数据
  const getAllMessages = useCallback(() => {
    return contacts.map((contact) => ({
      contactId: contact.id,
      messages: messages,
    }))
  }, [contacts, messages])

  // 处理消息选择（从搜索结果跳转）
  const handleSelectMessage = (contactId: string, messageId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    if (contact) {
      setSelectedContact(contact)
      setShowSearchPage(false)
      HapticFeedback.light()
    }
  }

  // 处理高级搜索
  const handleAdvancedSearch = (filters: any) => {
    setShowSearchPage(true)
    HapticFeedback.light()
  }

  // 处理搜索框焦点
  const handleSearchFocus = () => {
    setShowSearchSuggestions(true)
  }

  const handleSearchBlur = () => {
    // 延迟关闭，给用户时间点击建议
    setTimeout(() => {
      setShowSearchSuggestions(false)
    }, 200)
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
      {/* 长按使用指导 */}
      <LongPressGuide />

      {/* 搜索快捷键 */}
      <SearchShortcuts
        onOpenSearch={() => {
          setShowSearchPage(true)
          searchInputRef.current?.focus()
        }}
        onOpenAdvancedSearch={() => setShowAdvancedSearch(true)}
      />

      {/* 来电界面 */}
      {callState.isActive && callState.isIncoming && callState.status === "ringing" && (
        <RealIncomingCall callState={callState} onAnswer={answerCall} onDecline={endCall} />
      )}

      {/* 通话界面 */}
      {callState.isActive &&
        callState.status !== "ended" &&
        (!callState.isIncoming || callState.status !== "ringing") && (
          <RealCallInterface
            callState={callState}
            localStream={localStream}
            remoteStream={remoteStream}
            onEndCall={endCall}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleSpeaker={toggleSpeaker}
            formatDuration={formatDuration}
          />
        )}

      {/* 左侧边栏 */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setCurrentPage("profile")}>
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&text=我"} />
                <AvatarFallback>{user?.name?.[0] || "我"}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">{isConnected ? "已连接" : "连接中..."}</span>
              </div>
            </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowSearchPage(true)}>
                    <Search className="h-4 w-4 mr-2" />
                    搜索消息
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAdvancedSearch(true)}>
                    <Filter className="h-4 w-4 mr-2" />
                    高级搜索
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentPage("starred")}>
                    <Star className="h-4 w-4 mr-2" />
                    星标消息
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    已归档
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCurrentPage("settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    设置
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="搜索或开始新聊天"
              className="pl-10 bg-gray-100 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleGlobalSearch(searchQuery)
                }
              }}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {/* 搜索建议 */}
            <SearchSuggestions
              isOpen={showSearchSuggestions}
              query={searchQuery}
              contacts={contacts}
              recentSearches={recentSearches}
              onSelectSuggestion={handleSearchSuggestion}
              onClearRecentSearches={() => {
                setRecentSearches([])
                localStorage.removeItem("recentSearches")
              }}
              onRemoveRecentSearch={handleRemoveRecentSearch}
            />
          </div>
        </div>

        {/* 连接状态提示 */}
        {!isConnected && (
          <div className="p-2">
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>连接已断开，正在尝试重连...</AlertDescription>
            </Alert>
          </div>
        )}

        {/* 联系人列表 */}
        <ScrollArea className="flex-1">
          {filteredContacts
            .sort((a, b) => {
              // 置顶的聊天排在前面
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              return 0
            })
            .map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact.id === contact.id}
                onSelect={setSelectedContact}
                onAction={handleContactAction}
              />
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
                {selectedContact.muted && <BellOff className="h-4 w-4 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-500">
                {isTyping ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    正在输入...
                  </span>
                ) : selectedContact.isGroup ? (
                  `${selectedContact.memberCount} 位成员`
                ) : selectedContact.online ? (
                  <span className="text-green-600">在线</span>
                ) : (
                  "上次在线时间：今天 14:30"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleVoiceCall} disabled={callState.isActive || !isConnected}>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleVideoCall} disabled={callState.isActive || !isConnected}>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage("starred")}>
              <Star className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  查看联系人
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="h-4 w-4 mr-2" />
                  搜索消息
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {selectedContact.muted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                  {selectedContact.muted ? "取消静音" : "静音通知"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  归档聊天
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除聊天
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 通话错误提示 */}
        {callError && (
          <div className="p-2">
            <Alert variant="destructive">
              <AlertDescription>{callError}</AlertDescription>
            </Alert>
          </div>
        )}

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
                onForward={handleForward}
                onStar={handleStar}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 回复预览 */}
        {replyingTo && (
          <div className="bg-blue-50 p-3 border-t border-blue-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-500 rounded"></div>
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    回复 {replyingTo.senderName || (replyingTo.sent ? "你" : selectedContact.name)}
                  </p>
                  <p className="text-sm text-blue-600 truncate max-w-[300px]">{replyingTo.text}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              ✕
            </Button>
          </div>
        )}

        {/* 编辑预览 */}
        {editingMessage && (
          <div className="bg-yellow-50 p-3 border-t border-yellow-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-yellow-500 rounded"></div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">编辑消息</p>
                  <p className="text-sm text-yellow-600">按 Enter 保存，Esc 取消</p>
                </div>
              </div>
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
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="mb-1">
                <Smile className="h-5 w-5" />
              </Button>

              <FileUpload onFileSelect={handleFileSelect} />

              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={editingMessage ? "编辑消息..." : "输入消息"}
                  className="min-h-[40px] max-h-[120px] resize-none bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={!isConnected}
                  rows={1}
                />
              </div>

              {messageText.trim() ? (
                <Button
                  size="icon"
                  className="bg-green-500 hover:bg-green-600 mb-1"
                  onClick={handleSendMessage}
                  disabled={!isConnected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <div className="mb-1">
                  <VoiceRecorder onSendVoice={handleSendVoice} onCancel={() => setIsRecordingVoice(false)} />
                </div>
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

      {/* 搜索页面 */}
      {showSearchPage && (
        <MessageSearchPage
          onBack={() => setShowSearchPage(false)}
          onSelectMessage={handleSelectMessage}
          contacts={contacts}
          getAllMessages={getAllMessages}
        />
      )}

      {/* 高级搜索对话框 */}
      <AdvancedSearchDialog
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        contacts={contacts}
      />
    </div>
  )
}
