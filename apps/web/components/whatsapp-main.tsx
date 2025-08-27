"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { WelcomeScreen } from "./welcome-screen";
import { CallInterface } from "./call-interface";
import { IncomingCall } from "./incoming-call";
import { ProfilePage } from "./profile-page";
import { CallsPage } from "./calls-page";
import { StatusPage } from "./status-page";
import { StarredMessagesPage } from "./starred-messages-page";
import { MessageSearchPage } from "./message-search-page";
import { SettingsPage } from "./settings-page";
import { CreateGroupDialog } from "./create-group-dialog";
import { AddFriendDialog } from "./add-friend-dialog";
import { AdvancedSearchDialog } from "./advanced-search-dialog";
import { CallMiniWindow } from "./call-mini-window";
import { useCall } from "../hooks/use-call";
import type { Contact, User, Message } from "../types";

// Mock data
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，最近怎么样？",
    timestamp: "10:30",
    unreadCount: 2,
    isOnline: true,
    isGroup: false,
    phone: "+86 138 0013 8000",
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "明天见面吧",
    timestamp: "09:15",
    unreadCount: 0,
    isOnline: false,
    isGroup: false,
    phone: "+86 139 0013 9000",
  },
  {
    id: "3",
    name: "工作群",
    avatar: "/placeholder.svg?height=40&width=40&text=工",
    lastMessage: "会议时间改到下午3点",
    timestamp: "昨天",
    unreadCount: 5,
    isOnline: true,
    isGroup: true,
    // 成员详情可选，这里省略
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      senderName: "张三",
      content: "你好！",
      timestamp: new Date("2024-01-15T10:00:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "2",
      senderId: "current-user",
      senderName: "我",
      content: "你好，最近怎么样？",
      timestamp: new Date("2024-01-15T10:30:00Z").toISOString(),
      type: "text",
      status: "read",
    },
  ],
  "2": [
    {
      id: "3",
      senderId: "2",
      senderName: "李四",
      content: "明天见面吧",
      timestamp: new Date("2024-01-15T09:15:00Z").toISOString(),
      type: "text",
      status: "delivered",
    },
  ],
  "3": [
    {
      id: "4",
      senderId: "1",
      senderName: "张三",
      content: "会议时间改到下午3点",
      timestamp: new Date("2024-01-14T18:00:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "5",
      senderId: "2",
      senderName: "李四",
      content: "好的，我知道了",
      timestamp: new Date("2024-01-14T18:01:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "6",
      senderId: "current-user",
      senderName: "我",
      content: "收到，准时参加",
      timestamp: new Date("2024-01-14T18:02:00Z").toISOString(),
      type: "text",
      status: "read",
    },
    {
      id: "7",
      senderId: "4",
      senderName: "王五",
      content: "我可能会晚到几分钟",
      timestamp: new Date("2024-01-14T18:03:00Z").toISOString(),
      type: "text",
      status: "read",
    },
  ],
};

export function WhatsAppMain() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<string>("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Dialog states
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] =
    useState(false);

  // Chat states
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use the call hook
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
    simulateIncomingCall,
    formatDuration,
  } = useCall();

  // Mock user data
  const user: User = {
    id: "current-user",
    username: "me",
    name: "我",
    avatar: "/placeholder.svg?height=40&width=40&text=我",
    phone: "+86 138 0000 0000",
    email: "me@example.com",
    status: "在线",
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Get selected contact
  const selectedContact = selectedContactId
    ? mockContacts.find((c) => c.id === selectedContactId)
    : null;

  // Filter contacts based on search
  const filteredContacts = mockContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for selected contact - ensure it returns an array
  const getMessagesForContact = (contactId: string): Message[] => {
    const contactMessages = mockMessages[contactId];
    return Array.isArray(contactMessages) ? contactMessages : [];
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setCurrentPage("chat");
  };

  // Handle contact actions
  const handleContactAction = (action: string, contact: Contact) => {
    switch (action) {
      case "call":
        console.log("Starting voice call with:", contact.name);
        startCall(contact.id, contact.name, contact.avatar || "", "voice");
        break;
      case "video-call":
        console.log("Starting video call with:", contact.name);
        startCall(contact.id, contact.name, contact.avatar || "", "video");
        break;
      case "delete":
        console.log("Delete contact:", contact);
        break;
      case "block":
        console.log("Block contact:", contact);
        break;
      case "pin":
        console.log("Pin contact:", contact);
        break;
      case "mute":
        console.log("Mute contact:", contact);
        break;
      default:
        break;
    }
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchSuggestions(false), 200);
  };

  const handleGlobalSearch = (query: string) => {
    if (query.trim()) {
      setRecentSearches((prev) =>
        [query, ...prev.filter((s) => s !== query)].slice(0, 10)
      );
      setCurrentPage("search");
    }
  };

  const handleSearchSuggestion = (suggestion: any) => {
    if (suggestion.type === "contact") {
      const contact = mockContacts.find((c) => c.id === suggestion.id);
      if (contact) {
        handleContactSelect(contact);
      }
    }
    setShowSearchSuggestions(false);
  };

  const handleRemoveRecentSearch = (search: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== search));
  };

  // Message handling functions
  const handleMessageChange = (text: string) => {
    setMessageText(text);
    if (text.trim() && !isTyping) {
      setIsTyping(true);
      // Stop typing after 3 seconds
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim()) {
        handleSendMessage(messageText.trim());
      }
    }
  };

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "video" | "audio" | "file" = "text"
  ) => {
    if (!content.trim() && type === "text") return;
    if (!selectedContactId) return;

    console.log("Sending message:", content, type);

    // Create new message
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "我",
      content,
      timestamp: new Date().toISOString(),
      type,
      status: "sent",
    };

    // Add to messages
    if (mockMessages[selectedContactId]) {
      mockMessages[selectedContactId].push(newMessage);
    } else {
      mockMessages[selectedContactId] = [newMessage];
    }

    // Clear input
    setMessageText("");
    setReplyingTo(null);
    setEditingMessage(null);
    setIsTyping(false);

    // Simulate response - different for groups vs individual chats
    const isGroupChat = selectedContact?.isGroup;

    setTimeout(
      () => {
        if (isGroupChat) {
          // Group chat: simulate multiple random responses from different members
          const groupMembers = [
            { id: "1", name: "张三" },
            { id: "2", name: "李四" },
            { id: "4", name: "王五" },
          ];

          const randomMember =
            groupMembers[Math.floor(Math.random() * groupMembers.length)];
          const groupResponses = [
            "同意！",
            "好主意",
            "我也这么想",
            "没问题",
            "👍",
            "收到",
            "让我想想",
            "这个可以",
            "支持",
            "赞成",
          ];

          const randomResponse =
            groupResponses[Math.floor(Math.random() * groupResponses.length)];

          const responseMessage: Message = {
            id: (Date.now() + Math.random()).toString(),
            senderId: randomMember.id,
            senderName: randomMember.name,
            content: randomResponse,
            timestamp: new Date().toISOString(),
            type: "text",
            status: "delivered",
          };

          if (mockMessages[selectedContactId]) {
            mockMessages[selectedContactId].push(responseMessage);
          }
        } else {
          // Individual chat: single response
          const responses = [
            "好的，收到了！",
            "谢谢你的消息",
            "我稍后回复你",
            "明白了",
            "👍",
            "没问题",
          ];
          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];

          const responseMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContactId,
            senderName: selectedContact?.name || "联系人",
            content: randomResponse,
            timestamp: new Date().toISOString(),
            type: "text",
            status: "delivered",
          };

          if (mockMessages[selectedContactId]) {
            mockMessages[selectedContactId].push(responseMessage);
          }
        }
      },
      1000 + Math.random() * 2000
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
  };

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name);
    const fileType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "file";

    handleSendMessage(file.name, fileType);
  };

  const handleSendVoice = (audioBlob: Blob, duration: number) => {
    console.log("Voice message sent:", duration);
    handleSendMessage(`语音消息 ${Math.round(duration)}秒`, "audio");
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setMessageText(message.content);
  };

  const handleDelete = (message: Message) => {
    console.log("Delete message:", message.id);
  };

  const handleForward = (message: Message) => {
    console.log("Forward message:", message.id);
  };

  const handleStar = (message: Message) => {
    console.log("Star message:", message.id);
  };

  const handleInfo = (message: Message) => {
    console.log("Message info:", message.id);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  const handleRecordingChange = (isRecording: boolean) => {
    setIsRecordingVoice(isRecording);
  };

  // Page navigation handlers
  const handleProfileClick = () => setCurrentPage("profile");
  const handleStatusClick = () => setCurrentPage("status");
  const handleCallsClick = () => setCurrentPage("calls");
  const handleStarredClick = () => setCurrentPage("starred");
  const handleSettingsClick = () => setCurrentPage("settings");
  const handleSearchPageClick = () => setCurrentPage("search");

  // Dialog handlers
  const handleAdvancedSearchClick = () => {
    console.log("Opening advanced search dialog");
    setShowAdvancedSearchDialog(true);
  };

  const handleCreateGroupClick = () => {
    console.log("Opening create group dialog");
    setShowCreateGroupDialog(true);
  };

  const handleAddFriendClick = () => {
    console.log("Opening add friend dialog");
    setShowAddFriendDialog(true);
  };

  // Call handlers
  const handleVoiceCall = () => {
    if (selectedContact) {
      console.log("Starting voice call with:", selectedContact.name);
      startCall(
        selectedContact.id,
        selectedContact.name,
        selectedContact.avatar || "",
        "voice"
      );
    }
  };

  const handleVideoCall = () => {
    if (selectedContact) {
      console.log("Starting video call with:", selectedContact.name);
      startCall(
        selectedContact.id,
        selectedContact.name,
        selectedContact.avatar || "",
        "video"
      );
    }
  };

  const handleCallEnd = () => {
    endCall();
  };

  // Create group handler
  const handleCreateGroup = (name: string, selectedMembers: Contact[]) => {
    console.log("Creating group:", name, selectedMembers);
    const newGroup: Contact = {
      id: `group_${Date.now()}`,
      name,
      avatar: "/placeholder.svg?height=40&width=40&text=群",
      lastMessage: "群组已创建",
      timestamp: "刚刚",
      unreadCount: 0,
      isOnline: true,
      isGroup: true,
      members: selectedMembers
        .map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: "member" as const,
        }))
        .concat({
          id: "current-user",
          name: user.name || "我",
          avatar: user.avatar || "",
          role: "owner" as const,
        }),
    };
    setShowCreateGroupDialog(false);
  };

  // Add friend handler
  const handleAddFriend = (friendId: string) => {
    console.log("Adding friend:", friendId);
    setShowAddFriendDialog(false);
  };

  // Advanced search handler
  const handleAdvancedSearch = (filters: any) => {
    console.log("Advanced search with filters:", filters);
    setShowAdvancedSearchDialog(false);
    setCurrentPage("search");
  };

  // Message search handler
  const handleSelectMessage = (contactId: string, messageId: string) => {
    console.log("Select message:", contactId, messageId);
    const contact = mockContacts.find((c) => c.id === contactId);
    if (contact) {
      handleContactSelect(contact);
    }
  };

  // Render current page
  const renderCurrentPage = () => {
    // If there's an active call and it's not minimized, show call interface
    if (callState?.isActive && !callState.isMinimized) {
      return (
        <CallInterface
          callState={callState}
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={handleCallEnd}
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
      );
    }

    switch (currentPage) {
      case "profile":
        return <ProfilePage onBack={() => setCurrentPage("chat")} />;
      case "calls":
        return <CallsPage onBack={() => setCurrentPage("chat")} />;
      case "status":
        return <StatusPage onBack={() => setCurrentPage("chat")} />;
      case "starred":
        return <StarredMessagesPage onBack={() => setCurrentPage("chat")} />;
      case "search":
        return (
          <MessageSearchPage
            isOpen={true}
            onClose={() => setCurrentPage("chat")}
            initialQuery={searchQuery}
            allMessages={Object.entries(mockMessages).map(
              ([contactId, messages]) => ({
                contactId,
                messages,
              })
            )}
            contacts={mockContacts}
            onSelectMessage={handleSelectMessage}
          />
        );
      case "settings":
        return (
          <SettingsPage
            onBack={() => setCurrentPage("chat")}
            onProfileClick={handleProfileClick}
          />
        );
      case "chat":
      default:
        return selectedContact ? (
          <ChatArea
            selectedContact={selectedContact}
            messages={getMessagesForContact(selectedContact.id)}
            messageText={messageText}
            showEmojiPicker={showEmojiPicker}
            replyingTo={replyingTo}
            editingMessage={editingMessage}
            isRecordingVoice={isRecordingVoice}
            isTyping={isTyping}
            isConnected={isConnected}
            onMessageChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            onSendMessage={handleSendMessage}
            onEmojiSelect={handleEmojiSelect}
            onToggleEmojiPicker={handleToggleEmojiPicker}
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
            onShowInfo={() => {}}
            onCancelReply={handleCancelReply}
            onCancelEdit={handleCancelEdit}
            onRecordingChange={handleRecordingChange}
          />
        ) : (
          <WelcomeScreen />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        user={user}
        contacts={filteredContacts}
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

      {/* Picture-in-Picture Call Window */}
      {callState?.isActive && callState.isMinimized && (
        <CallMiniWindow
          callState={callState}
          localStream={localStream}
          onEndCall={endCall}
          onMaximize={maximizeCall}
          formatDuration={formatDuration}
        />
      )}

      {/* Incoming Call - only show if call is ringing */}
      {callState?.status === "ringing" && (
        <div className="fixed inset-0 z-50">
          <IncomingCall
            callState={callState}
            onAnswer={answerCall}
            onDecline={endCall}
            onQuickReply={(msg) => console.log("quick reply:", msg)}
          />
        </div>
      )}

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        contacts={mockContacts.filter((c) => !c.isGroup)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Add Friend Dialog */}
      <AddFriendDialog
        isOpen={showAddFriendDialog}
        onClose={() => setShowAddFriendDialog(false)}
        onAddFriend={handleAddFriend}
      />

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        isOpen={showAdvancedSearchDialog}
        onClose={() => setShowAdvancedSearchDialog(false)}
        contacts={mockContacts}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
}
