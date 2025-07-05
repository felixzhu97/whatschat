"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area"
import { WelcomeScreen } from "./welcome-screen"
import { ProfilePage } from "./profile-page"
import { CallsPage } from "./calls-page"
import { StatusPage } from "./status-page"
import { StarredMessagesPage } from "./starred-messages-page"
import { MessageSearchPage } from "./message-search-page"
import { SettingsPage } from "./settings-page"
import { CreateGroupDialog } from "./create-group-dialog"
import { AddFriendDialog } from "./add-friend-dialog"
import { AdvancedSearchDialog } from "./advanced-search-dialog"
import { CallInterface } from "./call-interface"
import { IncomingCall } from "./incoming-call"
import { useContactsStore } from "../stores/contacts-store"
import { useMessagesStore } from "../stores/messages-store"
import { useCallsStore } from "../stores/calls-store"
import { useSettingsStore } from "../stores/settings-store"
import type { Contact, User, Message } from "../types"
import type { VoiceRecording } from "../hooks/use-voice-recorder"

type ActivePage = "chat" | "profile" | "calls" | "status" | "starred" | "search" | "settings"

export function WhatsAppMain() {
  // Zustand stores
  const {
    contacts,
    selectedContactId,
    searchQuery,
    setSelectedContact,
    setSearchQuery,
    getSelectedContact,
    updateLastMessage,
    clearUnreadCount,
  } = useContactsStore()

  const {
    getMessagesForContact,
    addMessage,
    updateMessage,
    deleteMessage,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    clearEditingMessage,
    isUserTyping,
    setTyping,
    markAsRead,
    starMessage,
    unstarMessage,
    forwardMessage,
  } = useMessagesStore()

  const { activeCall, incomingCall, startCall, endCall, answerCall, declineCall } = useCallsStore()
  const { settings, getEffectiveTheme } = useSettingsStore()

  // Local state
  const [activePage, setActivePage] = useState<ActivePage>("chat")
  const [messageText, setMessageText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)

  // Dialog states
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Mock user data
  const user: User = {
    id: "current-user",
    name: "我",
    avatar: "/placeholder.svg?height=40&width=40&text=我",
    phoneNumber: "+86 138 0000 0000",
    email: "me@example.com",
    status: "在线",
    isOnline: true,
    lastSeen: new Date().toISOString(),
    settings: {
      theme: settings.theme,
      notifications: settings.notifications,
      privacy: settings.privacy,
      chat: settings.chat,
      calls: settings.calls,
    },
  }

  // Get selected contact and messages
  const selectedContact = getSelectedContact()
  const currentMessages = selectedContactId ? getMessagesForContact(selectedContactId) : []

  // Apply theme
  useEffect(() => {
    const theme = getEffectiveTheme()
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [settings.theme, getEffectiveTheme])

  // Mark messages as read when contact is selected
  useEffect(() => {
    if (selectedContactId && selectedContact?.unreadCount > 0) {
      const messageIds = currentMessages.map((msg) => msg.id)
      markAsRead(selectedContactId, messageIds)
      clearUnreadCount(selectedContactId)
    }
  }, [selectedContactId, selectedContact?.unreadCount, currentMessages, markAsRead, clearUnreadCount])

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact.id)
    setActivePage("chat") // 确保切换到聊天页面
  }

  // Handle contact actions
  const handleContactAction = (action: string, contact: Contact) => {
    switch (action) {
      case "call":
        startCall(contact.id, "voice")
        break
      case "video-call":
        startCall(contact.id, "video")
        break
      case "delete":
        console.log("Delete contact:", contact)
        break
      case "block":
        console.log("Block contact:", contact)
        break
      case "pin":
        console.log("Pin contact:", contact)
        break
      case "mute":
        console.log("Mute contact:", contact)
        break
      default:
        break
    }
  }

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchSuggestions(false), 200)
  }

  const handleGlobalSearch = (query: string) => {
    if (query.trim()) {
      setRecentSearches((prev) => [query, ...prev.filter((s) => s !== query)].slice(0, 10))
      setActivePage("search")
    }
  }

  const handleSearchSuggestion = (suggestion: any) => {
    if (suggestion.type === "contact") {
      const contact = contacts.find((c) => c.id === suggestion.id)
      if (contact) {
        handleContactSelect(contact)
      }
    }
    setShowSearchSuggestions(false)
  }

  const handleRemoveRecentSearch = (search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search))
  }

  // Message handling
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    // Send typing indicator
    if (selectedContactId && e.target.value.length > 0) {
      setTyping(selectedContactId, true)
      setTimeout(() => {
        setTyping(selectedContactId, false)
      }, 3000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && settings.chat.enterToSend) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContactId) return

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: "current-user",
      senderName: "我",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sending",
      replyTo: replyingTo?.id,
    }

    // Handle editing
    if (editingMessage) {
      updateMessage(selectedContactId, editingMessage.id, {
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
        isEdited: true,
      })
      clearEditingMessage()
    } else {
      // Add new message
      addMessage(selectedContactId, newMessage)

      // Update contact's last message
      updateLastMessage(selectedContactId, messageText.trim(), newMessage.timestamp)

      // Simulate message status updates
      setTimeout(() => {
        updateMessage(selectedContactId, newMessage.id, { status: "sent" })
      }, 1000)

      setTimeout(() => {
        updateMessage(selectedContactId, newMessage.id, { status: "delivered" })
      }, 2000)

      setTimeout(() => {
        updateMessage(selectedContactId, newMessage.id, { status: "read" })
      }, 3000)
    }

    // Clear input and states
    setMessageText("")
    setReplyingTo(null)
    setShowEmojiPicker(false)

    // Clear typing indicator
    if (selectedContactId) {
      setTyping(selectedContactId, false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (file: File, type: "image" | "file") => {
    if (!selectedContactId) return

    const fileUrl = URL.createObjectURL(file)
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: "current-user",
      senderName: "我",
      content: messageText.trim() || (type === "image" ? "图片" : file.name),
      timestamp: new Date().toISOString(),
      type,
      status: "sending",
      attachments: [
        {
          id: `att_${Date.now()}`,
          type,
          url: fileUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        },
      ],
    }

    addMessage(selectedContactId, newMessage)
    updateLastMessage(selectedContactId, newMessage.content, newMessage.timestamp)
    setMessageText("")
  }

  const handleSendVoice = (recording: VoiceRecording) => {
    if (!selectedContactId) return

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: "current-user",
      senderName: "我",
      content: "语音消息",
      timestamp: new Date().toISOString(),
      type: "audio",
      status: "sending",
      duration: recording.duration,
      attachments: [
        {
          id: `att_${Date.now()}`,
          type: "audio",
          url: recording.url,
          name: "voice_message.wav",
          size: recording.size || 0,
          mimeType: "audio/wav",
        },
      ],
    }

    addMessage(selectedContactId, newMessage)
    updateLastMessage(selectedContactId, "语音消息", newMessage.timestamp)
  }

  // Message actions
  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const handleEdit = (messageId: string, text: string) => {
    if (!selectedContactId) return
    updateMessage(selectedContactId, messageId, { content: text, isEdited: true })
  }

  const handleDelete = (messageId: string) => {
    if (!selectedContactId) return
    deleteMessage(selectedContactId, messageId)
  }

  const handleForward = (message: Message) => {
    console.log("Forward message:", message)
  }

  const handleStar = (messageId: string) => {
    if (!selectedContactId) return
    const message = currentMessages.find((m) => m.id === messageId)
    if (message?.isStarred) {
      unstarMessage(selectedContactId, messageId)
    } else {
      starMessage(selectedContactId, messageId)
    }
  }

  const handleInfo = (message: Message) => {
    console.log("Message info:", message)
  }

  // Call handlers
  const handleVoiceCall = () => {
    if (!selectedContact) return
    startCall(selectedContact.id, "voice")
  }

  const handleVideoCall = () => {
    if (!selectedContact) return
    startCall(selectedContact.id, "video")
  }

  const handleShowInfo = () => {
    console.log("Show contact info:", selectedContact)
  }

  // Page navigation handlers
  const handleProfileClick = () => setActivePage("profile")
  const handleStatusClick = () => setActivePage("status")
  const handleCallsClick = () => setActivePage("calls")
  const handleStarredClick = () => setActivePage("starred")
  const handleSettingsClick = () => setActivePage("settings")
  const handleSearchPageClick = () => setActivePage("search")
  const handleAdvancedSearchClick = () => setShowAdvancedSearchDialog(true)

  // Dialog handlers
  const handleCreateGroupClick = () => setShowCreateGroupDialog(true)
  const handleAddFriendClick = () => setShowAddFriendDialog(true)

  // Call handlers
  const handleCallAnswer = () => {
    if (incomingCall) {
      answerCall(incomingCall.id)
    }
  }

  const handleCallDecline = () => {
    if (incomingCall) {
      declineCall(incomingCall.id)
    }
  }

  const handleCallEnd = () => {
    if (activeCall) {
      endCall(activeCall.id, 0) // Duration will be calculated
    }
  }

  // Render current page
  const renderCurrentPage = () => {
    switch (activePage) {
      case "profile":
        return <ProfilePage user={user} onBack={() => setActivePage("chat")} />
      case "calls":
        return <CallsPage onBack={() => setActivePage("chat")} />
      case "status":
        return <StatusPage onBack={() => setActivePage("chat")} />
      case "starred":
        return <StarredMessagesPage onBack={() => setActivePage("chat")} />
      case "search":
        return <MessageSearchPage onBack={() => setActivePage("chat")} />
      case "settings":
        return <SettingsPage onBack={() => setActivePage("chat")} />
      case "chat":
      default:
        return selectedContact ? (
          <ChatArea
            selectedContact={selectedContact}
            messages={currentMessages}
            messageText={messageText}
            showEmojiPicker={showEmojiPicker}
            replyingTo={replyingTo}
            editingMessage={editingMessage}
            isRecordingVoice={isRecordingVoice}
            isTyping={selectedContactId ? isUserTyping(selectedContactId) : false}
            isConnected={isConnected}
            onMessageChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            onSendMessage={handleSendMessage}
            onEmojiSelect={handleEmojiSelect}
            onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
            onFileSelect={handleFileSelect}
            onSendVoice={handleSendVoice}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onForward={handleForward}
            onStar={handleStar}
            onInfo={handleInfo}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
            onShowInfo={handleShowInfo}
            onCancelReply={() => setReplyingTo(null)}
            onCancelEdit={clearEditingMessage}
            onRecordingChange={setIsRecordingVoice}
          />
        ) : (
          <WelcomeScreen />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        user={user}
        contacts={contacts}
        selectedContact={selectedContact}
        searchQuery={searchQuery}
        isConnected={isConnected}
        showSearchSuggestions={showSearchSuggestions}
        recentSearches={recentSearches}
        onContactSelect={handleContactSelect}
        onContactAction={handleContactAction}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onGlobalSearch={handleGlobalSearch}
        onSearchSuggestion={handleSearchSuggestion}
        onRemoveRecentSearch={handleRemoveRecentSearch}
        onProfileClick={handleProfileClick}
        onStatusClick={handleStatusClick}
        onCallsClick={handleCallsClick}
        onAddFriendClick={handleAddFriendClick}
        onCreateGroupClick={handleCreateGroupClick}
        onSearchPageClick={handleSearchPageClick}
        onAdvancedSearchClick={handleAdvancedSearchClick}
        onStarredClick={handleStarredClick}
        onSettingsClick={handleSettingsClick}
        searchInputRef={searchInputRef}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">{renderCurrentPage()}</div>

      {/* Active Call Interface */}
      {activeCall && (
        <div className="fixed inset-0 z-50">
          <CallInterface
            call={activeCall}
            onEndCall={handleCallEnd}
            onToggleMute={() => {}}
            onToggleVideo={() => {}}
            onToggleSpeaker={() => {}}
          />
        </div>
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <div className="fixed inset-0 z-50">
          <IncomingCall call={incomingCall} onAnswer={handleCallAnswer} onDecline={handleCallDecline} />
        </div>
      )}

      {/* Dialogs */}
      {showCreateGroupDialog && (
        <CreateGroupDialog
          contacts={contacts}
          onClose={() => setShowCreateGroupDialog(false)}
          onCreateGroup={(groupData) => {
            console.log("Create group:", groupData)
            setShowCreateGroupDialog(false)
          }}
        />
      )}

      {showAddFriendDialog && (
        <AddFriendDialog
          onClose={() => setShowAddFriendDialog(false)}
          onAddFriend={(friendData) => {
            console.log("Add friend:", friendData)
            setShowAddFriendDialog(false)
          }}
        />
      )}

      {showAdvancedSearchDialog && (
        <AdvancedSearchDialog
          onClose={() => setShowAdvancedSearchDialog(false)}
          onSearch={(searchParams) => {
            console.log("Advanced search:", searchParams)
            setShowAdvancedSearchDialog(false)
          }}
        />
      )}
    </div>
  )
}
