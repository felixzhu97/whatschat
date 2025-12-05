import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getStorageAdapter } from "../storage/storage.adapter";
import { Message } from "../../../domain/entities/message.entity";

interface MessagesState {
  messages: { [contactId: string]: Message[] };
  currentUserId: string;
  typingUsers: { [contactId: string]: boolean };
  selectedMessages: string[];
  replyingTo: Message | null;
  editingMessage: Message | null;
  searchResults: Message[];
  starredMessages: string[];

  setMessages: (messages: { [contactId: string]: Message[] }) => void;
  addMessage: (contactId: string, message: Message) => void;
  updateMessage: (
    contactId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  deleteMessage: (contactId: string, messageId: string) => void;
  deleteMessages: (contactId: string, messageIds: string[]) => void;
  setTyping: (contactId: string, isTyping: boolean) => void;
  isUserTyping: (contactId: string) => boolean;
  toggleMessageSelection: (messageId: string) => void;
  clearSelection: () => void;
  selectAllMessages: (contactId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  cancelReply: () => void;
  cancelEdit: () => void;
  toggleStarMessage: (contactId: string, messageId: string) => void;
  getStarredMessages: () => Message[];
  searchMessages: (query: string, contactId?: string) => Message[];
  clearSearchResults: () => void;
  getMessagesForContact: (contactId: string) => Message[];
  getMessageById: (
    contactId: string,
    messageId: string
  ) => Message | undefined;
  getLastMessage: (contactId: string) => Message | undefined;
  getUnreadCount: (contactId: string) => number;
  getTotalMessageCount: () => number;
  generateMessageId: () => string;
  formatTimestamp: (timestamp: string) => string;
  canEditMessage: (message: Message) => boolean;
  canDeleteMessage: (message: Message) => boolean;
}

const storageAdapter = getStorageAdapter();

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: {},
      currentUserId: "current-user",
      typingUsers: {},
      selectedMessages: [],
      replyingTo: null,
      editingMessage: null,
      searchResults: [],
      starredMessages: [],

      setMessages: (messages) => set({ messages }),

      addMessage: (contactId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: [...(state.messages[contactId] || []), message],
          },
        })),

      updateMessage: (contactId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          },
        })),

      deleteMessage: (contactId, messageId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).filter(
              (msg) => msg.id !== messageId
            ),
          },
          selectedMessages: state.selectedMessages.filter(
            (id) => id !== messageId
          ),
        })),

      deleteMessages: (contactId, messageIds) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).filter(
              (msg) => !messageIds.includes(msg.id)
            ),
          },
          selectedMessages: state.selectedMessages.filter(
            (id) => !messageIds.includes(id)
          ),
        })),

      setTyping: (contactId, isTyping) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [contactId]: isTyping,
          },
        })),

      isUserTyping: (contactId) => {
        const { typingUsers } = get();
        return typingUsers[contactId] || false;
      },

      toggleMessageSelection: (messageId) =>
        set((state) => ({
          selectedMessages: state.selectedMessages.includes(messageId)
            ? state.selectedMessages.filter((id) => id !== messageId)
            : [...state.selectedMessages, messageId],
        })),

      clearSelection: () => set({ selectedMessages: [] }),

      selectAllMessages: (contactId) => {
        const { messages } = get();
        const contactMessages = messages[contactId] || [];
        set({ selectedMessages: contactMessages.map((msg) => msg.id) });
      },

      setReplyingTo: (message) => set({ replyingTo: message }),
      setEditingMessage: (message) => set({ editingMessage: message }),
      cancelReply: () => set({ replyingTo: null }),
      cancelEdit: () => set({ editingMessage: null }),

      toggleStarMessage: (contactId, messageId) =>
        set((state) => ({
          starredMessages: state.starredMessages.includes(messageId)
            ? state.starredMessages.filter((id) => id !== messageId)
            : [...state.starredMessages, messageId],
        })),

      getStarredMessages: () => {
        const { messages, starredMessages } = get();
        const starred: Message[] = [];

        for (const contactId in messages) {
          const contactMessages = messages[contactId] || [];
          contactMessages.forEach((msg) => {
            if (starredMessages.includes(msg.id)) {
              starred.push(msg);
            }
          });
        }

        return starred.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      },

      searchMessages: (query, contactId) => {
        const { messages } = get();
        const results: Message[] = [];
        const searchQuery = query.toLowerCase();

        const messagesToSearch = contactId
          ? { [contactId]: messages[contactId] || [] }
          : messages;

        for (const cId in messagesToSearch) {
          const contactMessages = messagesToSearch[cId] || [];
          contactMessages.forEach((msg) => {
            if (msg.content.toLowerCase().includes(searchQuery)) {
              results.push(msg);
            }
          });
        }

        const sortedResults = results.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        set({ searchResults: sortedResults });
        return sortedResults;
      },

      clearSearchResults: () => set({ searchResults: [] }),

      getMessagesForContact: (contactId) => {
        const { messages } = get();
        return messages[contactId] || [];
      },

      getMessageById: (contactId, messageId) => {
        const { messages } = get();
        const contactMessages = messages[contactId] || [];
        return contactMessages.find((msg) => msg.id === messageId);
      },

      getLastMessage: (contactId) => {
        const { messages } = get();
        const contactMessages = messages[contactId] || [];
        return contactMessages[contactMessages.length - 1];
      },

      getUnreadCount: (contactId) => {
        const { messages, currentUserId } = get();
        const contactMessages = messages[contactId] || [];
        return contactMessages.filter(
          (msg) =>
            msg.senderId !== currentUserId && msg.status !== "read"
        ).length;
      },

      getTotalMessageCount: () => {
        const { messages } = get();
        let total = 0;
        for (const contactId in messages) {
          total += messages[contactId].length;
        }
        return total;
      },

      generateMessageId: () =>
        `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      formatTimestamp: (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours =
          (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
          return date.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (diffInHours < 24 * 7) {
          return date.toLocaleDateString("zh-CN", { weekday: "short" });
        } else {
          return date.toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
          });
        }
      },

      canEditMessage: (message) => {
        const { currentUserId } = get();
        const messageAge = Date.now() - new Date(message.timestamp).getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        return (
          message.senderId === currentUserId &&
          messageAge < fifteenMinutes &&
          message.type === "text"
        );
      },

      canDeleteMessage: (message) => {
        const { currentUserId } = get();
        return message.senderId === currentUserId;
      },
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => storageAdapter.load(name, null),
        setItem: (name, value) => storageAdapter.save(name, value),
        removeItem: (name) => storageAdapter.remove(name),
      })),
    }
  )
);

