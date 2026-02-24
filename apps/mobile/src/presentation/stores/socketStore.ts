import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/src/config/api';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
}

let currentSocket: Socket | null = null;
let currentToken: string | null = null;

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  connected: false,

  connect: (token: string) => {
    if (!token) {
      currentSocket?.disconnect();
      currentSocket = null;
      currentToken = null;
      set({ socket: null, connected: false });
      return;
    }
    if (currentSocket && currentToken === token) return;

    currentSocket?.disconnect();
    currentToken = token;
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    currentSocket = socket;

    socket.on('connect', () => set({ socket, connected: true }));
    socket.on('disconnect', () => set({ connected: false }));
    socket.on('connect_error', () => set({ connected: false }));

    set({ socket, connected: socket.connected });
  },

  disconnect: () => {
    currentSocket?.disconnect();
    currentSocket = null;
    currentToken = null;
    set({ socket: null, connected: false });
  },
}));
