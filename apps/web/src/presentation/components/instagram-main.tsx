"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { WelcomeScreen } from "./welcome-screen";
import { ProfilePage } from "./profile-page";
import { InstagramNav } from "./instagram-nav";
import { InstagramFeed } from "./instagram-feed";
import { InstagramRightSidebar } from "./instagram-right-sidebar";
import { CallsPage } from "./calls-page";
import { StatusPage } from "./status-page";
import { StarredMessagesPage } from "./starred-messages-page";
import { MessageSearchPage } from "./message-search-page";
import { SettingsPage } from "./settings-page";
import { CreateGroupDialog } from "./create-group-dialog";
import { AddFriendDialog } from "./add-friend-dialog";
import { AdvancedSearchDialog } from "./advanced-search-dialog";
import { VideoGenerateDialog } from "./video-generate-dialog";
import { TextGenerateDialog } from "./text-generate-dialog";
import { ImageGenerateDialog } from "./image-generate-dialog";
import { VoiceGenerateDialog } from "./voice-generate-dialog";
import { RealIncomingCall } from "./real-incoming-call";
import { RealCallInterface } from "./real-call-interface";
import { useRealCall } from "../hooks/use-real-call";
import { getWebRTCManager } from "@/src/lib/webrtc";
import { useMessages } from "../hooks/use-messages";
import { useAnalytics } from "@whatschat/analytics";
import { PAGE_VIEW, CHAT_OPEN, SEND_MESSAGE, CALL_START, CALL_END, AI_ACTION } from "@whatschat/analytics";
import { useSearch } from "../hooks/use-search";
import { useDialogs } from "../hooks/use-dialogs";
import { useNavigation } from "../hooks/use-navigation";
import { useChatsWithLiveMessages } from "../hooks/use-chats-with-live-messages";
import { useAuth } from "../hooks/use-auth";
import { useFeed } from "../hooks/use-feed";
import { useTranslation } from "@/src/shared/i18n";
import { FeedCommentsDialog } from "./feed-comments-dialog";
import { CreatePostDialog } from "./create-post-dialog";
import { styled } from "@/src/shared/utils/emotion";
import {
  mockContacts,
  mockMessages,
  mockUser,
  mockStories,
  mockFeedPosts,
  mockSuggestedUsers,
} from "@/infrastructure/data/mock-data";
import {
  getMessagesForContact,
  handleContactAction,
} from "@/shared/utils/message-utils";
import type { Contact, User, Message, FeedPost } from "@/shared/types";
import { AiApiAdapter } from "@/infrastructure/adapters/api/ai-api.adapter";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";

const AppShell = styled.div`
  display: flex;
  height: 100vh;
  background-color: rgb(255 255 255);
`;

const CenterColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(255 255 255);
`;

const MessagesRow = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const FloatingMessagesBtn = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: calc(320px + 1.5rem);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 24px;
  border: none;
  background-color: rgb(255 255 255);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.15);
  color: rgb(38 38 38);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: rgb(250 250 250);
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
`;

const ErrorToast = styled.div`
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  background-color: rgb(254 226 226);
  color: rgb(153 27 27);
`;

type InstagramView = "feed" | "messages";

export function InstagramMain() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [instagramView, setInstagramView] = useState<InstagramView>("feed");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const analytics = useAnalytics();
  const { user: currentUser } = useAuth();
  const feed = useFeed(currentUser?.id);
  const { t } = useTranslation();

  useEffect(() => {
    analytics.track(PAGE_VIEW, { path: "/", title: "Chat" });
    if (currentUser?.id) analytics.identify(currentUser.id);
  }, [currentUser?.id, analytics]);

  useEffect(() => {
    if (selectedContactId) analytics.track(CHAT_OPEN, { chatId: selectedContactId });
  }, [selectedContactId, analytics]);

  useEffect(() => {
    if (currentUser?.id && instagramView === "feed") feed.loadFeed();
  }, [currentUser?.id, instagramView]);

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

  type SendMessageFn = (
    content: string,
    type?: "text" | "image" | "video" | "audio" | "file",
    options?: { mediaUrl?: string }
  ) => void;
  const handleSendMessageWrapper = (
    content: string,
    type: "text" | "image" | "video" | "audio" | "file" = "text",
    options?: { mediaUrl?: string }
  ) => {
    if (chatsWithLive.isApiChat) {
      (chatsWithLive.handleSendMessage as SendMessageFn)(content, type, options);
      clearInput();
    } else {
      handleSendMessage(content, type);
    }
    if (selectedContactId) {
      analytics.track(SEND_MESSAGE, { chatId: selectedContactId, type });
    }
  };

  const aiApi = new AiApiAdapter(getApiClient());
  const handleSmartReplyClick = () => {
    const recent = chatsWithLive.messagesForSelected.slice(-10).map((m) => ({
      role: m.senderId === currentUser?.id ? "user" : "assistant",
      content: m.content,
    }));
    if (recent.length === 0) return;
    aiApi
      .postChat(recent)
      .then((res) => {
        if (res.success && res.data?.content) handleMessageChange(res.data.content);
      })
      .catch(() => {});
  };
  const chatIdForAnalytics = selectedContactId ?? undefined;
  const handleGenerateVideoClick = () => {
    analytics.track(AI_ACTION, { action: "video", step: "open", chatId: chatIdForAnalytics });
    setShowVideoDialog(true);
  };
  const handleVideoGenerateSuccess = (videoUrl: string) => {
    analytics.track(AI_ACTION, { action: "video", step: "send_to_chat", chatId: chatIdForAnalytics });
    handleSendMessageWrapper("", "video", { mediaUrl: videoUrl });
    setShowVideoDialog(false);
  };
  const handleGenerateTextClick = () => {
    analytics.track(AI_ACTION, { action: "text", step: "open", chatId: chatIdForAnalytics });
    setShowTextDialog(true);
  };
  const handleTextGenerateSuccess = (content: string) => {
    analytics.track(AI_ACTION, { action: "text", step: "send_to_chat", chatId: chatIdForAnalytics });
    handleSendMessageWrapper(content, "text");
    setShowTextDialog(false);
  };
  const handleGenerateImageClick = () => {
    analytics.track(AI_ACTION, { action: "image", step: "open", chatId: chatIdForAnalytics });
    setShowImageDialog(true);
  };
  const handleImageGenerateSuccess = (imageUrl: string) => {
    analytics.track(AI_ACTION, { action: "image", step: "send_to_chat", chatId: chatIdForAnalytics });
    handleSendMessageWrapper("", "image", { mediaUrl: imageUrl });
    setShowImageDialog(false);
  };
  const handleGenerateVoiceClick = () => {
    analytics.track(AI_ACTION, { action: "voice", step: "open", chatId: chatIdForAnalytics });
    setShowVoiceDialog(true);
  };
  const handleVoiceGenerateSuccess = (audioUrl: string) => {
    analytics.track(AI_ACTION, { action: "voice", step: "send_to_chat", chatId: chatIdForAnalytics });
    handleSendMessageWrapper("", "audio", { mediaUrl: audioUrl });
    setShowVoiceDialog(false);
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

  const filteredContacts = filterContacts(contactsForList, searchQuery);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    handleBackToChat();
  };

  const handleContactActionWrapper = (action: string, contact: Contact) => {
    const startCallWithOptions = (
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: "voice" | "video"
    ) => {
      startCall(
        contactId,
        contactName,
        contactAvatar,
        callType,
        isConnected ? { chatId: contactId } : undefined
      );
    };
    handleContactAction(action, contact, startCallWithOptions);
  };

  const handleGlobalSearchWrapper = (query: string) => {
    handleGlobalSearch(query);
    handleSearchPageClick();
  };

  const handleSearchSuggestionWrapper = (suggestion: any) => {
    handleSearchSuggestion(suggestion, mockContacts, handleContactSelect);
  };

  const handleStartCall = (callType: "voice" | "video") => {
    if (!selectedContact?.id) return;
    const id = selectedContact.id;
    const name = selectedContact.name ?? "";
    const avatar = selectedContact.avatar ?? "";
    analytics.track(CALL_START, { chatId: id, callType });
    startCall(id, name, avatar, callType, isConnected ? { chatId: id } : undefined);
  };

  const handleEndCallWrapper = () => {
    if (callState?.contactId) {
      analytics.track(CALL_END, { chatId: callState.contactId, callType: callState.callType, duration: callState.duration });
    }
    endCall();
  };

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

  const handleAddFriend = (friendId: string) => {
    console.log("Adding friend:", friendId);
    closeAddFriendDialog();
  };

  const handleAdvancedSearch = (filters: any) => {
    console.log("Advanced search with filters:", filters);
    closeAdvancedSearchDialog();
    handleSearchPageClick();
  };

  const handleSelectMessage = (contactId: string, messageId: string) => {
    console.log("Select message:", contactId, messageId);
    const contact = mockContacts.find((c) => c.id === contactId);
    if (contact) {
      handleContactSelect(contact);
    }
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<Element>) => {
    handleKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>);
  };

  const renderCenterContent = () => {
    if (callState?.isActive) {
      return (
        <RealCallInterface
          callState={callState}
          localStream={localStream as MediaStream | null}
          remoteStream={remoteStream as MediaStream | null}
          onEndCall={handleEndCallWrapper}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleSpeaker={toggleSpeaker}
          formatDuration={formatDuration}
        />
      );
    }

    if (currentPage === "chat" && instagramView === "feed") {
      return (
        <CenterColumn style={{ overflow: "auto" }}>
          <InstagramFeed
            stories={mockStories}
            posts={feed.posts.length > 0 ? feed.posts : mockFeedPosts}
            loading={feed.loading}
            error={feed.error}
            currentUser={currentUser ?? undefined}
            onCommentClick={setCommentPost}
          />
          <FeedCommentsDialog
            post={commentPost}
            open={!!commentPost}
            onClose={() => setCommentPost(null)}
            currentUser={currentUser ?? undefined}
          />
        </CenterColumn>
      );
    }

    if (currentPage === "chat" && instagramView === "messages") {
      return (
        <MessagesRow>
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
          <MainContent>
            {selectedContact ? (
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
                onKeyDown={handleKeyDownWrapper}
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
                onVoiceCall={() => handleStartCall("voice")}
                onVideoCall={() => handleStartCall("video")}
                onShowInfo={() => {}}
                onCancelReply={handleCancelReply}
                onCancelEdit={handleCancelEdit}
                onRecordingChange={handleRecordingChange}
                onSmartReplyClick={
                  chatsWithLive.isApiChat ? handleSmartReplyClick : undefined
                }
                onGenerateVideoClick={
                  chatsWithLive.isApiChat ? handleGenerateVideoClick : undefined
                }
                onGenerateTextClick={
                  chatsWithLive.isApiChat ? handleGenerateTextClick : undefined
                }
                onGenerateImageClick={
                  chatsWithLive.isApiChat ? handleGenerateImageClick : undefined
                }
                onGenerateVoiceClick={
                  chatsWithLive.isApiChat ? handleGenerateVoiceClick : undefined
                }
              />
            ) : (
              <WelcomeScreen />
            )}
          </MainContent>
        </MessagesRow>
      );
    }

    switch (currentPage) {
      case "profile":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <ProfilePage
              user={currentUser ?? null}
              posts={feed.posts.length > 0 ? feed.posts : mockFeedPosts}
              onEditProfile={handleSettingsClick}
              onNewPost={() => setShowCreatePostDialog(true)}
              onPostClick={setCommentPost}
            />
            <FeedCommentsDialog
              post={commentPost}
              open={!!commentPost}
              onClose={() => setCommentPost(null)}
              currentUser={currentUser ?? undefined}
            />
          </CenterColumn>
        );
      case "calls":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <CallsPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "status":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <StatusPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "starred":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <StarredMessagesPage onBack={handleBackToChat} />
          </CenterColumn>
        );
      case "search":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
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
          </CenterColumn>
        );
      case "settings":
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <SettingsPage
              onBack={handleBackToChat}
              onProfileClick={handleProfileClick}
            />
          </CenterColumn>
        );
        default:
        return (
          <CenterColumn style={{ overflow: "auto" }}>
            <InstagramFeed
              stories={mockStories}
              posts={feed.posts.length > 0 ? feed.posts : mockFeedPosts}
              loading={feed.loading}
              error={feed.error}
              currentUser={currentUser ?? undefined}
              onCommentClick={setCommentPost}
            />
            <FeedCommentsDialog
              post={commentPost}
              open={!!commentPost}
              onClose={() => setCommentPost(null)}
              currentUser={currentUser ?? undefined}
            />
          </CenterColumn>
        );
    }
  };

  const navActiveTab =
    currentPage === "profile"
      ? "profile"
      : currentPage === "chat" && instagramView === "messages"
        ? "messages"
        : "home";

  return (
    <AppShell>
      <InstagramNav
        user={currentUser ?? mockUser}
        activeTab={navActiveTab}
        onHomeClick={() => {
          handleBackToChat();
          setInstagramView("feed");
        }}
        onMessagesClick={() => {
          handleBackToChat();
          setInstagramView("messages");
        }}
        onProfileClick={handleProfileClick}
        onCreateClick={currentUser ? () => setShowCreatePostDialog(true) : undefined}
      />

      {renderCenterContent()}

      {currentPage === "chat" && instagramView === "feed" && (
        <InstagramRightSidebar
          user={currentUser ?? mockUser}
          suggestions={mockSuggestedUsers}
        />
      )}

      {currentPage === "chat" && instagramView === "feed" && (
        <FloatingMessagesBtn
          type="button"
          onClick={() => {
            handleBackToChat();
            setInstagramView("messages");
          }}
        >
          <Send size={20} />
          {t("nav.messages")}
        </FloatingMessagesBtn>
      )}

      {callState?.status === "ringing" && (
        <FullscreenOverlay>
          <RealIncomingCall
            callState={callState}
            onAnswer={answerCall}
            onDecline={endCall}
          />
        </FullscreenOverlay>
      )}

      {callError && <ErrorToast>{callError}</ErrorToast>}

      <CreateGroupDialog
        isOpen={showCreateGroupDialog}
        onClose={closeCreateGroupDialog}
        contacts={mockContacts.filter((c) => !c.isGroup)}
        onCreateGroup={handleCreateGroup}
      />

      <CreatePostDialog
        open={showCreatePostDialog}
        onClose={() => setShowCreatePostDialog(false)}
        onSubmit={async (caption, mediaUrls) => {
          await feed.createPost(
            caption,
            mediaUrls?.length ? "IMAGE" : "TEXT",
            {
              username: currentUser?.username,
              avatar: currentUser?.avatar,
            },
            mediaUrls
          );
        }}
        currentUser={currentUser ?? undefined}
      />

      <AddFriendDialog
        isOpen={showAddFriendDialog}
        onClose={closeAddFriendDialog}
        onAddFriend={handleAddFriend}
      />

      <AdvancedSearchDialog
        isOpen={showAdvancedSearchDialog}
        onClose={closeAdvancedSearchDialog}
        contacts={mockContacts}
        onSearch={handleAdvancedSearch}
      />

      <VideoGenerateDialog
        isOpen={showVideoDialog}
        onClose={() => setShowVideoDialog(false)}
        onSuccess={handleVideoGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, { action: "video", step: "generate_success", chatId: chatIdForAnalytics })
        }
      />

      <TextGenerateDialog
        isOpen={showTextDialog}
        onClose={() => setShowTextDialog(false)}
        onSuccess={handleTextGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, { action: "text", step: "generate_success", chatId: chatIdForAnalytics })
        }
      />

      <ImageGenerateDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onSuccess={handleImageGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, { action: "image", step: "generate_success", chatId: chatIdForAnalytics })
        }
      />

      <VoiceGenerateDialog
        isOpen={showVoiceDialog}
        onClose={() => setShowVoiceDialog(false)}
        onSuccess={handleVoiceGenerateSuccess}
        onTrackGenerateSuccess={() =>
          analytics.track(AI_ACTION, { action: "voice", step: "generate_success", chatId: chatIdForAnalytics })
        }
      />
    </AppShell>
  );
}
