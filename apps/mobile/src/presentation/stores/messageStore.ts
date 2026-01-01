import { create } from 'zustand';
import { Message } from '@/src/domain/entities';

interface MessageState {
  messages: Record<string, Message[]>;
  getMessages: (chatId: string) => Message[];
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  getMessages: (chatId) => get().messages[chatId] || [],
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),
  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((msg) => msg.id !== messageId),
      },
    })),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),
}));

