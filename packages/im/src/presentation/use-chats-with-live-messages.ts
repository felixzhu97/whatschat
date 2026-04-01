"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { Message } from "@whatschat/shared-types";
import type { IWebSocketAdapter, IChatsService, ChatListItem } from "../domain";
import {
  type ApiMessageLike,
  type SocketMessagePayload,
  mapApiMessageToMessage,
  mapSocketPayloadToMessage,
  mergeAndSortMessages,
  MESSAGE_LIMIT,
} from "../application";

export interface UseChatsWithLiveMessagesOptions {
  getChatsService: () => IChatsService;
  getWebSocketAdapter: () => IWebSocketAdapter;
}

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined,
  options: UseChatsWithLiveMessagesOptions
) {
  const { getChatsService, getWebSocketAdapter } = options;
  const chatsService = useMemo(() => getChatsService(), [getChatsService]);
  const ws = useMemo(() => getWebSocketAdapter(), [getWebSocketAdapter]);
  const [apiChats, setApiChats] = useState<ChatListItem[]>([]);
  const [apiMessagesByChatId, setApiMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [liveMessagesByChatId, setLiveMessagesByChatId] = useState<
    Record<string, Message[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    chatsService
      .getChats()
      .then((chats) => setApiChats(chats))
      .catch(() => setApiChats([]));
  }, [chatsService]);

  useEffect(() => {
    if (
      !selectedContactId ||
      !apiChats.some((c) => c.id === selectedContactId)
    ) {
      return;
    }
    chatsService
      .getChatMessages(selectedContactId, { limit: MESSAGE_LIMIT })
      .then((list) => {
        const msgs = list.map((m) =>
          mapApiMessageToMessage(m as unknown as ApiMessageLike)
        );
        setApiMessagesByChatId((prev) => ({
          ...prev,
          [selectedContactId]: msgs,
        }));
      })
      .catch(() => {});
  }, [selectedContactId, apiChats, chatsService]);

  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    const onIncoming = (payload: unknown) => {
      const p = payload as SocketMessagePayload;
      const chatId = p.to;
      if (!chatId || !p.from) return;
      const msg = mapSocketPayloadToMessage(p);
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
  }, [ws]);

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
      type: "text" | "image" | "video" | "audio" | "file" = "text",
      options?: { mediaUrl?: string }
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
        ...(options?.mediaUrl != null && { mediaUrl: options.mediaUrl }),
      };
      setApiMessagesByChatId((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] ?? []), optimistic],
      }));
      chatsService
        .sendMessage(selectedContactId, {
          content,
          type,
          ...(options?.mediaUrl != null && { mediaUrl: options.mediaUrl }),
        })
        .then((m: Message) => {
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
                        : (m.createdAt as string | undefined) ?? msg.timestamp,
                    ...((m as Message).mediaUrl != null && {
                      mediaUrl: (m as Message).mediaUrl,
                    }),
                  }
                : msg
            ),
          }));
        })
        .catch(() => {
          setApiMessagesByChatId((prev) => ({
            ...prev,
            [selectedContactId]: (prev[selectedContactId] ?? []).map((msg) =>
              msg.id === optimistic.id ? { ...msg, status: "failed" as const } : msg
            ),
          }));
        });
    },
    [isApiChat, selectedContactId, currentUserId, chatsService]
  );

  return {
    apiChats,
    isApiChat,
    messagesForSelected,
    isConnected,
    handleSendMessage,
  };
}
