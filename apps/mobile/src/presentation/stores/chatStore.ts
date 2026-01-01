import { create } from 'zustand';
import { Chat } from '@/src/domain/entities';

interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  setSelectedChat: (chat: Chat | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  selectedChat: null,
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      ),
    })),
  deleteChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
    })),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));

