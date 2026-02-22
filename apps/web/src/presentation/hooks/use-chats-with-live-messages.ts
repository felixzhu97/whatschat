"use client";

import { useEffect, useState, useCallback } from "react";
import { getWebSocketAdapter } from "@/src/infrastructure/adapters/websocket";
import { getChatsService } from "@/src/application/services/chats.service";
import {
  mapApiMessageToMessage,
  mapSocketPayloadToMessage,
  mergeAndSortMessages,
  type ApiMessageLike,
  type SocketMessagePayload,
} from "@/src/shared/utils/message-mappers";
import type { Contact, Message } from "@/src/shared/types";

const MESSAGE_LIMIT = 100;

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined
) {
  const [apiChats, setApiChats] = useState<Contact[]>([]);
  const [apiMessagesByChatId, setApiMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [liveMessagesByChatId, setLiveMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    getChatsService()
      .getChats()
      .then((chats) => setApiChats(chats as Contact[]))
      .catch(() => setApiChats([]));
  }, []);

  useEffect(() => {
    if (
      !selectedContactId ||
      !apiChats.some((c) => c.id === selectedContactId)
    ) {
      return;
    }
    getChatsService()
      .getChatMessages(selectedContactId, { limit: MESSAGE_LIMIT })
      .then((list) => {
        const msgs = list.map((m: ApiMessageLike) =>
          mapApiMessageToMessage(m)
        );
        setApiMessagesByChatId((prev) => ({
          ...prev,
          [selectedContactId]: msgs,
        }));
      })
      .catch(() => {});
  }, [selectedContactId, apiChats]);

  useEffect(() => {
    const ws = getWebSocketAdapter();
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    const onIncoming = (payload: SocketMessagePayload) => {
      const chatId = payload.to;
      if (!chatId || !payload.from) return;
      const msg = mapSocketPayloadToMessage(payload);
      setLiveMessagesByChatId((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), msg],
      }));
    };
    ws.on("connected", onConnected);
    ws.on("disconnected", onDisconnected);
    ws.on("message", onIncoming);
    setIsConnected(ws.isConnected());
    return () => {
      ws.off("connected", onConnected);
      ws.off("disconnected", onDisconnected);
      ws.off("message", onIncoming);
    };
  }, []);

  const isApiChat =
    selectedContactId != null &&
    apiChats.some((c) => c.id === selectedContactId);
  const messagesForSelected =
    selectedContactId && isApiChat
      ? mergeAndSortMessages(
          apiMessagesByChatId[selectedContactId] ?? [],
          liveMessagesByChatId[selectedContactId] ?? []
        )
      : [];

  const handleSendMessage = useCallback(
    (
      content: string,
      type: "text" | "image" | "video" | "audio" | "file" = "text"
    ) => {
      if (!isApiChat || !selectedContactId) return;
      const optimistic: Message = {
        id: `opt-${Date.now()}`,
        senderId: currentUserId ?? "me",
        senderName: "我",
        content,
        timestamp: new Date().toISOString(),
        type,
        status: "sending",
      };
      setApiMessagesByChatId((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] ?? []), optimistic],
      }));
      getChatsService()
        .sendMessage(selectedContactId, { content, type })
        .then((m: { id: string; timestamp?: string; createdAt?: string }) => {
          setApiMessagesByChatId((prev) => ({
            ...prev,
            [selectedContactId]: (prev[selectedContactId] ?? []).map((msg) =>
              msg.id === optimistic.id
                ? {
                    ...msg,
                    id: m.id,
                    status: "sent" as const,
                    timestamp:
                      typeof m.timestamp === "string"
                        ? m.timestamp
                        : m.createdAt ?? msg.timestamp,
                  }
                : msg
            ),
          }));
        })
        .catch(() => {
          setApiMessagesByChatId((prev) => ({
            ...prev,
            [selectedContactId]: (prev[selectedContactId] ?? []).map((msg) =>
              msg.id === optimistic.id
                ? { ...msg, status: "failed" as const }
                : msg
            ),
          }));
        });
    },
    [isApiChat, selectedContactId, currentUserId]
  );

  return {
    apiChats,
    isApiChat,
    messagesForSelected,
    isConnected,
    handleSendMessage,
  };
}
