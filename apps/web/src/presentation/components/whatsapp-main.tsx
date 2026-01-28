"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { useMessages } from "../hooks/use-messages";
import { useSearch } from "../hooks/use-search";
import { useDialogs } from "../hooks/use-dialogs";
import { useNavigation } from "../hooks/use-navigation";
import { getWebSocketAdapter } from "@/src/infrastructure/adapters/websocket";
import {
  mockContacts,
  mockMessages,
  mockUser,
} from "@/infrastructure/data/mock-data";
import {
  getMessagesForContact,
  handleContactAction,
} from "@/shared/utils/message-utils";
import type { Contact, User, Message } from "@/shared/types";

export function WhatsAppMain() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket adapter once on mount and keep connection state in sync
  useEffect(() => {
    const ws = getWebSocketAdapter();

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    ws.on("connected", handleConnected);
    ws.on("disconnected", handleDisconnected);

    // Set initial state based on current connection
    setIsConnected(ws.isConnected());

    return () => {
      ws.off("connected", handleConnected);
      ws.off("disconnected", handleDisconnected);
    };
  }, []);

  // Custom hooks
  const {
    currentPage,
    handleProfileClick,
    handleStatusClick,
    handleCallsClick,
    handleStarredClick,
    handleSettingsClick,
    handleSearchPageClick,
    handleBackToChat,
  } = useNavigation();

  const {
    searchQuery,
    showSearchSuggestions,
    recentSearches,
    searchInputRef,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleGlobalSearch,
    handleSearchSuggestion,
    handleRemoveRecentSearch,
    filterContacts,
  } = useSearch();

  const {
    showCreateGroupDialog,
    showAddFriendDialog,
    showAdvancedSearchDialog,
    handleCreateGroupClick,
    handleAddFriendClick,
    handleAdvancedSearchClick,
    closeCreateGroupDialog,
    closeAddFriendDialog,
    closeAdvancedSearchDialog,
  } = useDialogs();

  const selectedContact = selectedContactId
    ? mockContacts.find((c) => c.id === selectedContactId)
    : null;

  const {
    messageText,
    showEmojiPicker,
    replyingTo,
    editingMessage,
    isRecordingVoice,
    isTyping,
    handleMessageChange,
    handleKeyPress,
    handleSendMessage,
    handleEmojiSelect,
    handleToggleEmojiPicker,
    handleFileSelect,
    handleSendVoice,
    handleReply,
    handleEdit,
    handleDelete,
    handleForward,
    handleStar,
    handleInfo,
    handleCancelReply,
    handleCancelEdit,
    handleRecordingChange,
  } = useMessages({
    selectedContactId,
    selectedContact: selectedContact ?? null,
  });

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

  // Filter contacts based on search
  const filteredContacts = filterContacts(mockContacts, searchQuery);

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    handleBackToChat();
  };

  // Handle contact actions
  const handleContactActionWrapper = (action: string, contact: Contact) => {
    handleContactAction(action, contact, startCall);
  };

  // Handle search
  const handleGlobalSearchWrapper = (query: string) => {
    handleGlobalSearch(query);
    handleSearchPageClick();
  };

  const handleSearchSuggestionWrapper = (suggestion: any) => {
    handleSearchSuggestion(suggestion, mockContacts, handleContactSelect);
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
      members: [
        ...selectedMembers.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: "member" as const,
        })),
        {
          id: "current-user",
          name: mockUser.name || "我",
          avatar: mockUser.avatar || "",
          role: "owner" as const,
        },
      ],
    };
    closeCreateGroupDialog();
  };

  // Add friend handler
  const handleAddFriend = (friendId: string) => {
    console.log("Adding friend:", friendId);
    closeAddFriendDialog();
  };

  // Advanced search handler
  const handleAdvancedSearch = (filters: any) => {
    console.log("Advanced search with filters:", filters);
    closeAdvancedSearchDialog();
    handleSearchPageClick();
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
          onApplyFilter={(filter) => applyFilter(filter ?? "none")}
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
        return <ProfilePage onBack={handleBackToChat} />;
      case "calls":
        return <CallsPage onBack={handleBackToChat} />;
      case "status":
        return <StatusPage onBack={handleBackToChat} />;
      case "starred":
        return <StarredMessagesPage onBack={handleBackToChat} />;
      case "search":
        return (
          <MessageSearchPage
            isOpen={true}
            onClose={handleBackToChat}
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
            onBack={handleBackToChat}
            onProfileClick={handleProfileClick}
          />
        );
      case "chat":
      default:
        return selectedContact ? (
          <ChatArea
            selectedContact={selectedContact}
            messages={getMessagesForContact(selectedContact.id, mockMessages)}
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
        user={mockUser}
        contacts={filteredContacts}
        selectedContact={selectedContact ?? null}
        searchQuery={searchQuery}
        isConnected={isConnected}
        showSearchSuggestions={showSearchSuggestions}
        recentSearches={recentSearches}
        onContactSelect={handleContactSelect}
        onContactAction={handleContactActionWrapper}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onGlobalSearch={handleGlobalSearchWrapper}
        onSearchSuggestion={handleSearchSuggestionWrapper}
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
        onClose={closeCreateGroupDialog}
        contacts={mockContacts.filter((c) => !c.isGroup)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Add Friend Dialog */}
      <AddFriendDialog
        isOpen={showAddFriendDialog}
        onClose={closeAddFriendDialog}
        onAddFriend={handleAddFriend}
      />

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        isOpen={showAdvancedSearchDialog}
        onClose={closeAdvancedSearchDialog}
        contacts={mockContacts}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
}
