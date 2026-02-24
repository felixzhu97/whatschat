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
import { RealIncomingCall } from "./real-incoming-call";
import { RealCallInterface } from "./real-call-interface";
import { useRealCall } from "../hooks/use-real-call";
import { getWebRTCManager } from "@/src/lib/webrtc";
import { useMessages } from "../hooks/use-messages";
import { useSearch } from "../hooks/use-search";
import { useDialogs } from "../hooks/use-dialogs";
import { useNavigation } from "../hooks/use-navigation";
import { useChatsWithLiveMessages } from "../hooks/use-chats-with-live-messages";
import { useAuth } from "../hooks/use-auth";
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

  const { user: currentUser } = useAuth();

  const chatsWithLive = useChatsWithLiveMessages(
    selectedContactId,
    currentUser?.id
  );

  const contactsForList =
    chatsWithLive.apiChats.length > 0
      ? chatsWithLive.apiChats
      : (mockContacts as Contact[]);
  const selectedContact =
    selectedContactId != null
      ? contactsForList.find((c) => c.id === selectedContactId) ?? null
      : null;

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

  const messagesForSelected =
    chatsWithLive.isApiChat
      ? chatsWithLive.messagesForSelected
      : selectedContact
        ? [...getMessagesForContact(selectedContact.id, mockMessages)]
        : [];

  const {
    messageText,
    showEmojiPicker,
    replyingTo,
    editingMessage,
    isRecordingVoice,
    isTyping,
    handleMessageChange,
    handleKeyDown,
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
    clearInput,
  } = useMessages({
    selectedContactId,
    selectedContact: selectedContact ?? null,
  });

  const handleSendMessageWrapper = (
    content: string,
    type: "text" | "image" | "video" | "audio" | "file" = "text"
  ) => {
    if (chatsWithLive.isApiChat) {
      chatsWithLive.handleSendMessage(content, type);
      clearInput();
    } else {
      handleSendMessage(content, type);
    }
  };

  const isConnected = chatsWithLive.isConnected;
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
    formatDuration,
    error: callError,
  } = useRealCall();

  useEffect(() => {
    getWebRTCManager().setSimulatedMode(!isConnected);
  }, [isConnected]);

  // Filter contacts based on search
  const filteredContacts = filterContacts(contactsForList, searchQuery);

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

  const handleVoiceCall = () => {
    if (selectedContact) {
      startCall(selectedContact.id, selectedContact.name, selectedContact.avatar || "", "voice");
    }
  };

  const handleVideoCall = () => {
    if (selectedContact) {
      startCall(selectedContact.id, selectedContact.name, selectedContact.avatar || "", "video");
    }
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
    if (callState?.isActive) {
      return (
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
            messages={messagesForSelected}
            currentUserId={currentUser?.id}
            messageText={messageText}
            showEmojiPicker={showEmojiPicker}
            replyingTo={replyingTo}
            editingMessage={editingMessage}
            isRecordingVoice={isRecordingVoice}
            isTyping={isTyping}
            isConnected={isConnected}
            onMessageChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onSendMessage={handleSendMessageWrapper}
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

      {/* Incoming call */}
      {callState?.status === "ringing" && (
        <div className="fixed inset-0 z-50">
          <RealIncomingCall callState={callState} onAnswer={answerCall} onDecline={endCall} />
        </div>
      )}

      {callError && (
        <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          {callError}
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
