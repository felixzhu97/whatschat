import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/src/presentation/stores';
import { API_BASE_URL } from '@/src/config/api';
import { mapServerMessagePayload } from '@/src/application/services/MessageService';
import { Message } from '@/src/domain/entities';

type OnMessageReceived = (message: Message) => void;
type OnMessageSent = (message: Message) => void;

export function useSocket(
  onMessageReceived?: OnMessageReceived,
  onMessageSent?: OnMessageSent
) {
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onReceivedRef = useRef(onMessageReceived);
  const onSentRef = useRef(onMessageSent);
  onReceivedRef.current = onMessageReceived;
  onSentRef.current = onMessageSent;

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }
    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('message:received', (payload: Record<string, unknown>) => {
      onReceivedRef.current?.(mapServerMessagePayload(payload));
    });
    socket.on('message:sent', (payload: Record<string, unknown>) => {
      onSentRef.current?.(mapServerMessagePayload(payload));
    });
    socket.on('connect_error', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const sendMessage = useCallback(
    (chatId: string, content: string, type: string = 'TEXT') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message:send', { chatId, content, type });
      }
    },
    []
  );

  return { sendMessage, connected, socket: socketRef.current };
}
