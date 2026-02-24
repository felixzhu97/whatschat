import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '@/src/domain/entities';

interface MessageState {
  messages: Record<string, Message[]>;
}

const initialState: MessageState = {
  messages: {},
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: Message }>
    ) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) state.messages[chatId] = [];
      state.messages[chatId].push(message);
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        updates: Partial<Message>;
      }>
    ) => {
      const { chatId, messageId, updates } = action.payload;
      const list = state.messages[chatId];
      if (!list) return;
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx !== -1) list[idx] = { ...list[idx], ...updates };
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string }>
    ) => {
      const { chatId, messageId } = action.payload;
      const list = state.messages[chatId];
      if (list) {
        state.messages[chatId] = list.filter((m) => m.id !== messageId);
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: Message[] }>
    ) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
  },
});

export const {
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
} = messageSlice.actions;
export default messageSlice.reducer;
