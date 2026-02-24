import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import { store, type RootState, type AppDispatch } from '../store';

export { store };
export type { RootState, AppDispatch };

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Auth state selector - useAuthStore(selector) with selector(authState) */
export const useAuthStore = <T>(selector: (auth: RootState['auth']) => T): T =>
  useAppSelector((s) => selector(s.auth));

/** Socket state selector */
export const useSocketStore = <T>(selector: (socket: RootState['socket']) => T): T =>
  useAppSelector((s) => selector(s.socket));

/** Chat state selector */
export const useChatStore = <T>(selector: (chat: RootState['chat']) => T): T =>
  useAppSelector((s) => selector(s.chat));

/** Message state selector */
export const useMessageStore = <T>(selector: (message: RootState['message']) => T): T =>
  useAppSelector((s) => selector(s.message));

/** Theme state selector */
export const useThemeStore = <T>(selector: (theme: RootState['theme']) => T): T =>
  useAppSelector((s) => selector(s.theme));

export { setAuth, logout, hydrateAuth } from '../store/slices/authSlice';
export { connectSocket, disconnectSocket } from '../store/slices/socketSlice';
export {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
} from '../store/slices/chatSlice';
export {
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
} from '../store/slices/messageSlice';
export { setThemeMode } from '../store/slices/themeSlice';
