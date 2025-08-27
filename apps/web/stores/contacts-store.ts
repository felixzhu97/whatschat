import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { StorageManager } from "../lib/storage";
import type { Contact } from "../types";

// 默认联系人数据
const defaultContacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好！",
    timestamp: "2024-01-15T10:30:00Z",
    unreadCount: 2,
    isOnline: true,
    isGroup: false,
    phoneNumber: "+86 138 0013 8000",
    email: "zhangsan@example.com",
    status: "忙碌中...",
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "明天见面聊吧",
    timestamp: "2024-01-15T09:15:00Z",
    unreadCount: 0,
    isOnline: true,
    isGroup: false,
    lastSeen: "2024-01-15T09:20:00Z",
    phoneNumber: "+86 139 0013 9000",
    email: "lisi@example.com",
    status: "在线",
  },
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    lastMessage: "文件已发送",
    timestamp: "2024-01-14T16:20:00Z",
    unreadCount: 1,
    isOnline: false,
    isGroup: false,
    lastSeen: "2024-01-14T18:30:00Z",
    phoneNumber: "+86 137 0013 7000",
    status: "离开",
  },
  {
    id: "4",
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    lastMessage: "好的，收到了",
    timestamp: "2024-01-14T14:10:00Z",
    unreadCount: 0,
    isOnline: false,
    isGroup: false,
    lastSeen: "2024-01-14T16:45:00Z",
    phoneNumber: "+86 136 0013 6000",
    status: "离线",
  },
  {
    id: "5",
    name: "孙七",
    avatar: "/placeholder.svg?height=40&width=40&text=孙",
    lastMessage: "天气不错呢",
    timestamp: "2024-01-13T20:46:00Z",
    unreadCount: 3,
    isOnline: true,
    isGroup: false,
    phoneNumber: "+86 135 0013 5000",
    status: "在线",
  },
  {
    id: "group1",
    name: "项目讨论组",
    avatar: "/placeholder.svg?height=40&width=40&text=项目",
    lastMessage: "明天的会议准备好了吗？",
    timestamp: "2024-01-15T11:00:00Z",
    unreadCount: 5,
    isOnline: true,
    isGroup: true,
    status: "群聊 · 8人",
  },
];

interface ContactsState {
  contacts: Contact[];
  selectedContactId: string | null;
  searchQuery: string;
  filteredContacts: Contact[];
  favoriteContacts: string[];
  blockedContacts: string[];

  // Actions
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;

  // Selection
  setSelectedContact: (contactId: string | null) => void;
  getSelectedContact: () => Contact | null;

  // Search & Filter
  setSearchQuery: (query: string) => void;
  filterContacts: () => void;

  // Favorites
  addToFavorites: (contactId: string) => void;
  removeFromFavorites: (contactId: string) => void;
  isFavorite: (contactId: string) => boolean;

  // Block
  blockContact: (contactId: string) => void;
  unblockContact: (contactId: string) => void;
  isBlocked: (contactId: string) => boolean;

  // Online Status
  setOnlineStatus: (contactId: string, isOnline: boolean) => void;
  updateLastSeen: (contactId: string, timestamp: string) => void;

  // Messages
  updateLastMessage: (
    contactId: string,
    message: string,
    timestamp: string
  ) => void;
  updateUnreadCount: (contactId: string, count: number) => void;
  incrementUnreadCount: (contactId: string) => void;
  clearUnreadCount: (contactId: string) => void;

  // Computed
  getContactById: (contactId: string) => Contact | undefined;
  getOnlineContacts: () => Contact[];
  getContactsWithUnread: () => Contact[];
  getTotalUnreadCount: () => number;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: defaultContacts,
      selectedContactId: null,
      searchQuery: "",
      filteredContacts: defaultContacts,
      favoriteContacts: [],
      blockedContacts: [],

      // Actions
      setContacts: (contacts) => set({ contacts, filteredContacts: contacts }),

      addContact: (contact) =>
        set((state) => {
          const newContacts = [...state.contacts, contact];
          return {
            contacts: newContacts,
            filteredContacts: state.searchQuery
              ? newContacts.filter(
                  (c) =>
                    c.name
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase()) ||
                    c.lastMessage
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase())
                )
              : newContacts,
          };
        }),

      updateContact: (contactId, updates) =>
        set((state) => {
          const newContacts = state.contacts.map((contact) =>
            contact.id === contactId ? { ...contact, ...updates } : contact
          );
          return {
            contacts: newContacts,
            filteredContacts: state.searchQuery
              ? newContacts.filter(
                  (c) =>
                    c.name
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase()) ||
                    c.lastMessage
                      .toLowerCase()
                      .includes(state.searchQuery.toLowerCase())
                )
              : newContacts,
          };
        }),

      deleteContact: (contactId) =>
        set((state) => {
          const newContacts = state.contacts.filter(
            (contact) => contact.id !== contactId
          );
          return {
            contacts: newContacts,
            filteredContacts: newContacts,
            selectedContactId:
              state.selectedContactId === contactId
                ? null
                : state.selectedContactId,
          };
        }),

      // Selection
      setSelectedContact: (contactId) => set({ selectedContactId: contactId }),

      getSelectedContact: () => {
        const { contacts, selectedContactId } = get();
        return selectedContactId
          ? contacts.find((c) => c.id === selectedContactId) || null
          : null;
      },

      // Search & Filter
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().filterContacts();
      },

      filterContacts: () =>
        set((state) => {
          if (!state.searchQuery.trim()) {
            return { filteredContacts: state.contacts };
          }

          const query = state.searchQuery.toLowerCase();
          const filtered = state.contacts.filter(
            (contact) =>
              contact.name.toLowerCase().includes(query) ||
              contact.lastMessage.toLowerCase().includes(query) ||
              (contact.phoneNumber && contact.phoneNumber.includes(query))
          );

          return { filteredContacts: filtered };
        }),

      // Favorites
      addToFavorites: (contactId) =>
        set((state) => ({
          favoriteContacts: [
            ...state.favoriteContacts.filter((id) => id !== contactId),
            contactId,
          ],
        })),

      removeFromFavorites: (contactId) =>
        set((state) => ({
          favoriteContacts: state.favoriteContacts.filter(
            (id) => id !== contactId
          ),
        })),

      isFavorite: (contactId) => {
        const { favoriteContacts } = get();
        return favoriteContacts.includes(contactId);
      },

      // Block
      blockContact: (contactId) =>
        set((state) => ({
          blockedContacts: [
            ...state.blockedContacts.filter((id) => id !== contactId),
            contactId,
          ],
        })),

      unblockContact: (contactId) =>
        set((state) => ({
          blockedContacts: state.blockedContacts.filter(
            (id) => id !== contactId
          ),
        })),

      isBlocked: (contactId) => {
        const { blockedContacts } = get();
        return blockedContacts.includes(contactId);
      },

      // Online Status
      setOnlineStatus: (contactId, isOnline) =>
        get().updateContact(contactId, {
          isOnline,
          lastSeen: isOnline ? undefined : new Date().toISOString(),
        }),

      updateLastSeen: (contactId, timestamp) =>
        get().updateContact(contactId, { lastSeen: timestamp }),

      // Messages
      updateLastMessage: (contactId, message, timestamp) =>
        get().updateContact(contactId, { lastMessage: message, timestamp }),

      updateUnreadCount: (contactId, count) =>
        get().updateContact(contactId, { unreadCount: Math.max(0, count) }),

      incrementUnreadCount: (contactId) => {
        const contact = get().getContactById(contactId);
        if (contact) {
          get().updateContact(contactId, {
            unreadCount: contact.unreadCount + 1,
          });
        }
      },

      clearUnreadCount: (contactId) =>
        get().updateContact(contactId, { unreadCount: 0 }),

      // Computed
      getContactById: (contactId) => {
        const { contacts } = get();
        return contacts.find((contact) => contact.id === contactId);
      },

      getOnlineContacts: () => {
        const { contacts } = get();
        return contacts.filter((contact) => contact.isOnline);
      },

      getContactsWithUnread: () => {
        const { contacts } = get();
        return contacts.filter((contact) => contact.unreadCount > 0);
      },

      getTotalUnreadCount: () => {
        const { contacts } = get();
        return contacts.reduce(
          (total, contact) => total + contact.unreadCount,
          0
        );
      },
    }),
    {
      name: "contacts-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => StorageManager.load(name, null),
        setItem: (name, value) => StorageManager.save(name, value),
        removeItem: (name) => StorageManager.remove(name),
      })),
    }
  )
);
