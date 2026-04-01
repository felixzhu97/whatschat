import type { Message } from "@whatschat/shared-types";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import type { ApiMessageLike, SocketMessagePayload } from "./message-mapping.types";

export function mapApiMessageToMessage(m: ApiMessageLike): Message {
  return {
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName ?? "",
    content: m.content,
    timestamp:
      typeof m.timestamp === "string"
        ? m.timestamp
        : m.createdAt ?? new Date().toISOString(),
    type: (m.type?.toLowerCase() ?? "text") as Message["type"],
    status: (m.status ?? "delivered") as Message["status"],
    ...((m as { mediaUrl?: string }).mediaUrl != null && {
      mediaUrl: (m as { mediaUrl?: string }).mediaUrl,
    }),
  };
}

export function mapSocketPayloadToMessage(payload: SocketMessagePayload): Message {
  return {
    id: payload.data?.id ?? `live-${Date.now()}`,
    senderId: payload.from ?? "",
    senderName: "",
    content: payload.data?.text ?? "",
    timestamp: new Date(payload.timestamp ?? Date.now()).toISOString(),
    type: "text",
    status: "delivered",
  };
}

export function mergeAndSortMessages(api: Message[], live: Message[]): Message[] {
  return sortBy(uniqBy([...api, ...live], "id"), (message) =>
    new Date(message.timestamp ?? 0).getTime()
  );
}
