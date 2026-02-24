import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat } from '@/src/domain/entities';

interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },
    updateChat: (
      state,
      action: PayloadAction<{ chatId: string; updates: Partial<Chat> }>
    ) => {
      const idx = state.chats.findIndex((c) => c.id === action.payload.chatId);
      if (idx !== -1) {
        state.chats[idx] = { ...state.chats[idx], ...action.payload.updates };
      }
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
      if (state.selectedChat?.id === action.payload) {
        state.selectedChat = null;
      }
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      state.selectedChat = action.payload;
    },
  },
});

export const {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
} = chatSlice.actions;
export default chatSlice.reducer;
