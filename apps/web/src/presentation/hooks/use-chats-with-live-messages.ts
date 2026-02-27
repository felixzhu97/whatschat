"use client";

import { useChatsWithLiveMessages as useChatsWithLiveMessagesBase } from "@whatschat/im";
import { getChatsService } from "@/src/application/services/chats.service";
import { getWebSocketAdapter } from "@/src/infrastructure/adapters/websocket";

export function useChatsWithLiveMessages(
  selectedContactId: string | null,
  currentUserId: string | undefined
) {
  return useChatsWithLiveMessagesBase(selectedContactId, currentUserId, {
    getChatsService,
    getWebSocketAdapter,
  });
}
