import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StorageManager } from "../lib/storage"
import type { Message } from "../types"

// 默认消息数据
const defaultMessages: { [contactId: string]: Message[] } = {
  "1": [
    {
      id: "msg1",
      senderId: "1",
      senderName: "张三",
      content: "你好！最近怎么样？",
      timestamp: "2024-01-15T10:30:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg2",
      senderId: "current-user",
      senderName: "我",
      content: "还不错，你呢？",
      timestamp: "2024-01-15T10:31:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg3",
      senderId: "1",
      senderName: "张三",
      content: "挺好的，有空一起吃饭吧",
      timestamp: "2024-01-15T10:32:00Z",
      type: "text",
      status: "read",
    },
  ],
  "2": [
    {
      id: "msg4",
      senderId: "2",
      senderName: "李四",
      content: "明天的会议准备好了吗？",
      timestamp: "2024-01-15T09:15:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg5",
      senderId: "current-user",
      senderName: "我",
      content: "准备好了，PPT已经做完了",
      timestamp: "2024-01-15T09:16:00Z",
      type: "text",
      status: "delivered",
    },
    {
      id: "msg6",
      senderId: "2",
      senderName: "李四",
      content: "太好了，明天见面聊吧",
      timestamp: "2024-01-15T09:17:00Z",
      type: "text",
      status: "read",
    },
  ],
  "3": [
    {
      id: "msg7",
      senderId: "3",
      senderName: "王五",
      content: "文件已发送，请查收",
      timestamp: "2024-01-14T16:20:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg8",
      senderId: "current-user",
      senderName: "我",
      content: "收到了，谢谢！",
      timestamp: "2024-01-14T16:21:00Z",
      type: "text",
      status: "read",
    },
  ],
  "4": [
    {
      id: "msg9",
      senderId: "current-user",
      senderName: "我",
      content: "项目进度如何？",
      timestamp: "2024-01-14T14:09:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg10",
      senderId: "4",
      senderName: "赵六",
      content: "好的，收到了，正在处理中",
      timestamp: "2024-01-14T14:10:00Z",
      type: "text",
      status: "read",
    },
  ],
  "5": [
    {
      id: "msg11",
      senderId: "5",
      senderName: "孙七",
      content: "今天天气不错呢",
      timestamp: "2024-01-13T20:45:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg12",
      senderId: "current-user",
      senderName: "我",
      content: "是的，适合出去走走",
      timestamp: "2024-01-13T20:46:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg13",
      senderId: "5",
      senderName: "孙七",
      content: "周末一起出去玩吧",
      timestamp: "2024-01-13T20:47:00Z",
      type: "text",
      status: "read",
    },
  ],
  group1: [
    {
      id: "msg14",
      senderId: "user1",
      senderName: "张三",
      content: "大家好，明天的会议准备好了吗？",
      timestamp: "2024-01-15T11:00:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg15",
      senderId: "user2",
      senderName: "李四",
      content: "我这边准备好了",
      timestamp: "2024-01-15T11:01:00Z",
      type: "text",
      status: "read",
    },
    {
      id: "msg16",
      senderId: "current-user",
      senderName: "我",
      content: "PPT已经做完了，随时可以开始",
      timestamp: "2024-01-15T11:02:00Z",
      type: "text",
      status: "delivered",
    },
  ],
}

interface MessagesState {
  messages: { [contactId: string]: Message[] }
  currentUserId: string
  typingUsers: { [contactId: string]: boolean }
  selectedMessages: string[]
  replyingTo: Message | null
  editingMessage: Message | null
  searchResults: Message[]
  starredMessages: string[]

  // Actions
  setMessages: (messages: { [contactId: string]: Message[] }) => void
  addMessage: (contactId: string, message: Message) => void
  updateMessage: (contactId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (contactId: string, messageId: string) => void
  deleteMessages: (contactId: string, messageIds: string[]) => void

  // Message Operations
  sendMessage: (contactId: string, content: string, type?: Message["type"]) => void
  editMessage: (contactId: string, messageId: string, newContent: string) => void
  forwardMessage: (messageId: string, targetContactIds: string[]) => void
  replyToMessage: (contactId: string, replyTo: Message, content: string) => void

  // Message Status
  markAsRead: (contactId: string, messageIds: string[]) => void
  markAsDelivered: (contactId: string, messageIds: string[]) => void
  updateMessageStatus: (contactId: string, messageId: string, status: Message["status"]) => void

  // Selection
  toggleMessageSelection: (messageId: string) => void
  clearSelection: () => void
  selectAllMessages: (contactId: string) => void

  // Reply & Edit
  setReplyingTo: (message: Message | null) => void
  setEditingMessage: (message: Message | null) => void
  cancelReply: () => void
  cancelEdit: () => void

  // Starred Messages
  toggleStarMessage: (contactId: string, messageId: string) => void
  getStarredMessages: () => Message[]

  // Typing Indicators
  setTyping: (contactId: string, isTyping: boolean) => void
  isUserTyping: (contactId: string) => boolean

  // Search
  searchMessages: (query: string, contactId?: string) => Message[]
  clearSearchResults: () => void

  // Computed
  getMessagesForContact: (contactId: string) => Message[]
  getMessageById: (contactId: string, messageId: string) => Message | undefined
  getLastMessage: (contactId: string) => Message | undefined
  getUnreadCount: (contactId: string) => number
  getTotalMessageCount: () => number

  // Utilities
  generateMessageId: () => string
  formatTimestamp: (timestamp: string) => string
  canEditMessage: (message: Message) => boolean
  canDeleteMessage: (message: Message) => boolean
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: defaultMessages,
      currentUserId: "current-user",
      typingUsers: {},
      selectedMessages: [],
      replyingTo: null,
      editingMessage: null,
      searchResults: [],
      starredMessages: [],

      // Actions
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
              msg.id === messageId ? { ...msg, ...updates } : msg,
            ),
          },
        })),

      deleteMessage: (contactId, messageId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).filter((msg) => msg.id !== messageId),
          },
          selectedMessages: state.selectedMessages.filter((id) => id !== messageId),
        })),

      deleteMessages: (contactId, messageIds) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).filter((msg) => !messageIds.includes(msg.id)),
          },
          selectedMessages: state.selectedMessages.filter((id) => !messageIds.includes(id)),
        })),

      // Message Operations
      sendMessage: (contactId, content, type = "text") => {
        const message: Message = {
          id: get().generateMessageId(),
          senderId: get().currentUserId,
          senderName: "我",
          content,
          timestamp: new Date().toISOString(),
          type,
          status: "sending",
        }

        get().addMessage(contactId, message)

        // 模拟发送过程
        setTimeout(() => {
          get().updateMessage(contactId, message.id, { status: "sent" })
          setTimeout(() => {
            get().updateMessage(contactId, message.id, { status: "delivered" })
          }, 1000)
        }, 500)
      },

      editMessage: (contactId, messageId, newContent) => {
        get().updateMessage(contactId, messageId, {
          content: newContent,
          isEdited: true,
          editedAt: new Date().toISOString(),
        })
        get().setEditingMessage(null)
      },

      forwardMessage: (messageId, targetContactIds) => {
        const { messages } = get()
        let originalMessage: Message | undefined

        // 查找原始消息
        for (const contactId in messages) {
          const found = messages[contactId].find((msg) => msg.id === messageId)
          if (found) {
            originalMessage = found
            break
          }
        }

        if (originalMessage) {
          targetContactIds.forEach((contactId) => {
            const forwardedMessage: Message = {
              ...originalMessage,
              id: get().generateMessageId(),
              senderId: get().currentUserId,
              senderName: "我",
              timestamp: new Date().toISOString(),
              status: "sending",
              isForwarded: true,
            }
            get().addMessage(contactId, forwardedMessage)
          })
        }
      },

      replyToMessage: (contactId, replyTo, content) => {
        const message: Message = {
          id: get().generateMessageId(),
          senderId: get().currentUserId,
          senderName: "我",
          content,
          timestamp: new Date().toISOString(),
          type: "text",
          status: "sending",
          replyTo: replyTo.id,
        }

        get().addMessage(contactId, message)
        get().setReplyingTo(null)
      },

      // Message Status
      markAsRead: (contactId, messageIds) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).map((msg) =>
              messageIds.includes(msg.id) ? { ...msg, status: "read" } : msg,
            ),
          },
        })),

      markAsDelivered: (contactId, messageIds) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [contactId]: (state.messages[contactId] || []).map((msg) =>
              messageIds.includes(msg.id) && msg.status === "sent" ? { ...msg, status: "delivered" } : msg,
            ),
          },
        })),

      updateMessageStatus: (contactId, messageId, status) => get().updateMessage(contactId, messageId, { status }),

      // Selection
      toggleMessageSelection: (messageId) =>
        set((state) => ({
          selectedMessages: state.selectedMessages.includes(messageId)
            ? state.selectedMessages.filter((id) => id !== messageId)
            : [...state.selectedMessages, messageId],
        })),

      clearSelection: () => set({ selectedMessages: [] }),

      selectAllMessages: (contactId) => {
        const { messages } = get()
        const contactMessages = messages[contactId] || []
        set({ selectedMessages: contactMessages.map((msg) => msg.id) })
      },

      // Reply & Edit
      setReplyingTo: (message) => set({ replyingTo: message }),
      setEditingMessage: (message) => set({ editingMessage: message }),
      cancelReply: () => set({ replyingTo: null }),
      cancelEdit: () => set({ editingMessage: null }),

      // Starred Messages
      toggleStarMessage: (contactId, messageId) =>
        set((state) => ({
          starredMessages: state.starredMessages.includes(messageId)
            ? state.starredMessages.filter((id) => id !== messageId)
            : [...state.starredMessages, messageId],
        })),

      getStarredMessages: () => {
        const { messages, starredMessages } = get()
        const starred: Message[] = []

        for (const contactId in messages) {
          const contactMessages = messages[contactId] || []
          contactMessages.forEach((msg) => {
            if (starredMessages.includes(msg.id)) {
              starred.push(msg)
            }
          })
        }

        return starred.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      },

      // Typing Indicators
      setTyping: (contactId, isTyping) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [contactId]: isTyping,
          },
        })),

      isUserTyping: (contactId) => {
        const { typingUsers } = get()
        return typingUsers[contactId] || false
      },

      // Search
      searchMessages: (query, contactId) => {
        const { messages } = get()
        const results: Message[] = []
        const searchQuery = query.toLowerCase()

        const messagesToSearch = contactId ? { [contactId]: messages[contactId] || [] } : messages

        for (const cId in messagesToSearch) {
          const contactMessages = messagesToSearch[cId] || []
          contactMessages.forEach((msg) => {
            if (msg.content.toLowerCase().includes(searchQuery)) {
              results.push(msg)
            }
          })
        }

        const sortedResults = results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        set({ searchResults: sortedResults })
        return sortedResults
      },

      clearSearchResults: () => set({ searchResults: [] }),

      // Computed
      getMessagesForContact: (contactId) => {
        const { messages } = get()
        return messages[contactId] || []
      },

      getMessageById: (contactId, messageId) => {
        const { messages } = get()
        const contactMessages = messages[contactId] || []
        return contactMessages.find((msg) => msg.id === messageId)
      },

      getLastMessage: (contactId) => {
        const { messages } = get()
        const contactMessages = messages[contactId] || []
        return contactMessages[contactMessages.length - 1]
      },

      getUnreadCount: (contactId) => {
        const { messages, currentUserId } = get()
        const contactMessages = messages[contactId] || []
        return contactMessages.filter((msg) => msg.senderId !== currentUserId && msg.status !== "read").length
      },

      getTotalMessageCount: () => {
        const { messages } = get()
        let total = 0
        for (const contactId in messages) {
          total += messages[contactId].length
        }
        return total
      },

      // Utilities
      generateMessageId: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      formatTimestamp: (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
          return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        } else if (diffInHours < 24 * 7) {
          return date.toLocaleDateString("zh-CN", { weekday: "short" })
        } else {
          return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
        }
      },

      canEditMessage: (message) => {
        const { currentUserId } = get()
        const messageAge = Date.now() - new Date(message.timestamp).getTime()
        const fifteenMinutes = 15 * 60 * 1000

        return message.senderId === currentUserId && messageAge < fifteenMinutes && message.type === "text"
      },

      canDeleteMessage: (message) => {
        const { currentUserId } = get()
        return message.senderId === currentUserId
      },
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => StorageManager.load(name, null),
        setItem: (name, value) => StorageManager.save(name, value),
        removeItem: (name) => StorageManager.remove(name),
      })),
    },
  ),
)
