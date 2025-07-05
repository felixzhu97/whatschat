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
  BellOff,
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
import { AddFriendDialog } from "./add-friend-dialog"
import { SettingsPage } from "./settings-page"
import { ProfilePage } from "./profile-page"
import { CallsPage } from "./calls-page"
import { StatusPage } from "./status-page"
import { StarredMessagesPage } from "./starred-messages-page"
import { useChat } from "../hooks/use-chat"
import { useCall } from "../hooks/use-call"
import { MessageBubble } from "./message-bubble"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { VoiceRecorder } from "./voice-recorder"
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
import { CallInterface } from "./call-interface"
import { IncomingCall } from "./incoming-call"
import { CallMiniWindow } from "./call-mini-window"

// 初始联系人数据
const initialContacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，今天有空吗？",
    time: "14:30",
    unread: 2,
    online: true,
    pinned: true,
    muted: false,
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
    pinned: false,
    muted: false,
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "好的，明天见！",
    time: "12:15",
    pinned: false,
    muted: true,
  },
]

// 模拟消息数据
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "msg1",
      text: "你好，今天有空吗？",
      time: "2024-01-07 14:30",
      sender: "1",
      senderName: "张三",
      type: "text",
      status: "read",
    },
    {
      id: "msg2",
      text: "有空的，什么事？",
      time: "2024-01-07 14:32",
      sender: "me",
      senderName: "我",
      type: "text",
      status: "sent",
    },
  ],
  group1: [
    {
      id: "msg3",
      text: "明天的会议改到下午3点",
      time: "2024-01-07 15:20",
      sender: "user2",
      senderName: "李四",
      type: "text",
      status: "read",
    },
    {
      id: "msg4",
      text: "收到，我会准时参加",
      time: "2024-01-07 15:22",
      sender: "me",
      senderName: "我",
      type: "text",
      status: "sent",
    },
  ],
  "2": [
    {
      id: "msg5",
      text: "好的，明天见！",
      time: "2024-01-07 12:15",
      sender: "2",
      senderName: "李四",
      type: "text",
      status: "read",
    },
  ],
}

export function WhatsAppMain() {
  // 状态管理 - 确保所有数组都有默认值
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null)
  const [messageText, setMessageText] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showAddFriend, setShowAddFriend] = useState(false)
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
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()

  // 使用聊天 Hook - 确保有默认联系人
  const selectedContactId = selectedContact?.id || "1"
  const {
    messages = [],
    isTyping,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessage,
    editMessage,
  } = useChat(selectedContactId)

  // 使用通话 Hook
  const {
    callState,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    switchVideoLayout,
    toggleBeautyMode,
    applyFilter,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    minimizeCall,
    maximizeCall,
    showControls,
    formatDuration,
  } = useCall()

  // 初始化最近搜索记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches")
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error)
      setRecentSearches([])
    }
  }, [])

  // 过滤联系人 - 确保 contacts 不为空
  const filteredContacts = (contacts || []).filter(
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

  // 处理消息信息
  const handleMessageInfo = (message: Message) => {
    console.log("查看消息信息:", message)
    HapticFeedback.light()
  }

  // 发起语音通话
  const handleVoiceCall = async () => {
    if (!selectedContact) return
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
    if (!selectedContact) return
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
    setContacts((prevContacts) =>
      (prevContacts || []).map((c) => {
        if (c.id === contact.id) {
          switch (action) {
            case "pin":
              HapticFeedback.light()
              return { ...c, pinned: !c.pinned }
            case "mute":
              HapticFeedback.light()
              return { ...c, muted: !c.muted }
            case "archive":
              console.log("归档聊天:", contact.name)
              HapticFeedback.light()
              return c
            case "delete":
              console.log("删除聊天:", contact.name)
              HapticFeedback.medium()
              return c
            default:
              return c
          }
        }
        return c
      }),
    )

    // 如果当前选中的联系人被修改，也要更新
    if (selectedContact && selectedContact.id === contact.id) {
      setSelectedContact((prev) => {
        if (!prev) return prev
        switch (action) {
          case "pin":
            return { ...prev, pinned: !prev.pinned }
          case "mute":
            return { ...prev, muted: !prev.muted }
          default:
            return prev
        }
      })
    }
  }

  // 处理添加好友
  const handleAddFriend = (friendId: string) => {
    console.log("添加好友:", friendId)
    HapticFeedback.success()
  }

  // 处理全局搜索
  const handleGlobalSearch = (query: string) => {
    if (!query.trim()) return

    // 添加到最近搜索
    const updatedSearches = [query, ...(recentSearches || []).filter((s) => s !== query)].slice(0, 10)
    setRecentSearches(updatedSearches)
    try {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    } catch (error) {
      console.error("Failed to save recent searches:", error)
    }

    setShowSearchPage(true)
    setSearchQuery(query)
    setShowSearchSuggestions(false)
    HapticFeedback.light()
  }

  // 处理搜索建议选择
  const handleSearchSuggestion = (suggestion: any) => {
    if (suggestion.type === "contact") {
      const contact = (contacts || []).find((c) => c.id === suggestion.id.replace("contact-", ""))
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
    const updatedSearches = (recentSearches || []).filter((s) => s !== search)
    setRecentSearches(updatedSearches)
    try {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    } catch (error) {
      console.error("Failed to save recent searches:", error)
    }
    HapticFeedback.light()
  }

  // 获取所有消息数据 - 修复函数实现
  const getAllMessages = useCallback(() => {
    return contacts.map((contact) => ({
      contactId: contact.id,
      messages: mockMessages[contact.id] || [], // 使用模拟数据
    }))
  }, [contacts])

  // 处理消息选择（从搜索结果跳转）
  const handleSelectMessage = (contactId: string, messageId: string) => {
    const contact = (contacts || []).find((c) => c.id === contactId)
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

  // 如果不是聊天页面，显示其他页面
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
      {callState.isActive && callState.status === "ringing" && (
        <IncomingCall callState={callState} onAnswer={answerCall} onDecline={endCall} />
      )}

      {/* 通话界面 */}
      {callState.isActive &&
        callState.status !== "ended" &&
        callState.status !== "ringing" &&
        !callState.isMinimized && (
          <CallInterface
            callState={callState}
            localStream={localStream}
            remoteStream={remoteStream}
            onEndCall={endCall}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleSpeaker={toggleSpeaker}
            onSwitchCamera={switchCamera}
            onSwitchVideoLayout={switchVideoLayout}
            onToggleBeautyMode={toggleBeautyMode}
            onApplyFilter={applyFilter}
            onStartScreenShare={startScreenShare}
            onStopScreenShare={stopScreenShare}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onMinimize={minimizeCall}
            onShowControls={showControls}
            formatDuration={formatDuration}
          />
        )}

      {/* 小窗口通话 */}
      {callState.isActive && callState.status === "connected" && callState.isMinimized && (
        <CallMiniWindow
          callState={callState}
          localStream={localStream}
          onEndCall={endCall}
          onMaximize={maximizeCall}
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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddFriend(true)}>
                <UserPlus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    新建群组
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleGlobalSearch(searchQuery)
                }
              }}
              className="pl-10 bg-white"
            />

            {/* 搜索建议 */}
            {showSearchSuggestions && (
              <SearchSuggestions
                query={searchQuery}
                contacts={contacts || []}
                recentSearches={recentSearches || []}
                onSelect={handleSearchSuggestion}
                onRemoveRecent={handleRemoveRecentSearch}
                onAdvancedSearch={() => setShowAdvancedSearch(true)}
              />
            )}
          </div>
        </div>

        {/* 联系人列表 */}
        <ScrollArea className="flex-1">
          {filteredContacts
            .sort((a, b) => {
              // 置顶的联系人排在前面
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              return 0
            })
            .map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onSelect={setSelectedContact}
                onAction={handleContactAction}
              />
            ))}
        </ScrollArea>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* 聊天头部 */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium flex items-center gap-2">
                    {selectedContact.name}
                    {selectedContact.isGroup && <Users className="h-4 w-4 text-gray-500" />}
                    {selectedContact.muted && <BellOff className="h-4 w-4 text-gray-400" />}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {selectedContact.online && !selectedContact.isGroup && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>在线</span>
                      </>
                    )}
                    {selectedContact.isGroup && <span>{selectedContact.memberCount} 位成员</span>}
                    {isTyping && <span className="text-green-600">正在输入...</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleVideoCall}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowGroupInfo(!showGroupInfo)}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 连接状态提示 */}
            {!isConnected && (
              <Alert className="m-4 border-orange-200 bg-orange-50">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>连接已断开，正在重新连接...</AlertDescription>
              </Alert>
            )}

            {/* 消息区域 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages || []).map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isGroup={selectedContact.isGroup}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={deleteMessage}
                    onForward={handleForward}
                    onStar={handleStar}
                    onInfo={handleMessageInfo}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* 回复预览 */}
            {replyingTo && (
              <div className="mx-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">回复 {replyingTo.senderName || "对方"}</p>
                  <p className="text-sm text-gray-600 truncate">{replyingTo.text}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 编辑预览 */}
            {editingMessage && (
              <div className="mx-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">编辑消息</p>
                  <p className="text-sm text-gray-600 truncate">{editingMessage.text}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingMessage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 输入区域 */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <FileUpload onFileSelect={handleFileSelect} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="relative"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 relative">
                  <Textarea
                    ref={inputRef}
                    value={messageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="输入消息..."
                    className="min-h-[40px] max-h-[120px] resize-none pr-12"
                    rows={1}
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-10">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                    </div>
                  )}
                </div>

                {messageText.trim() ? (
                  <Button onClick={handleSendMessage} size="icon" className="bg-green-500 hover:bg-green-600">
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <VoiceRecorder
                    onSendVoice={handleSendVoice}
                    isRecording={isRecordingVoice}
                    onRecordingChange={setIsRecordingVoice}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-24 h-24 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">欢迎使用 WhatsApp Web</h2>
              <p className="text-gray-500 mb-4">发送和接收消息，无需保持手机在线。</p>
              <p className="text-sm text-gray-400">选择一个聊天开始对话</p>
            </div>
          </div>
        )}
      </div>

      {/* 群组信息面板 */}
      {showGroupInfo && selectedContact && selectedContact.isGroup && (
        <GroupInfoPanel contact={selectedContact} onClose={() => setShowGroupInfo(false)} />
      )}

      {/* 对话框 */}
      <CreateGroupDialog
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={(groupData) => {
          console.log("创建群组:", groupData)
          setShowCreateGroup(false)
        }}
      />

      <AddFriendDialog isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} onAddFriend={handleAddFriend} />

      {/* 消息搜索页面 */}
      <MessageSearchPage
        isOpen={showSearchPage}
        onClose={() => setShowSearchPage(false)}
        initialQuery={searchQuery}
        allMessages={getAllMessages()}
        contacts={contacts || []}
        onSelectMessage={handleSelectMessage}
      />

      {/* 高级搜索对话框 */}
      <AdvancedSearchDialog
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        contacts={contacts || []}
      />
    </div>
  )
}
