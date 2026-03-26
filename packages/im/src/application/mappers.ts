import type { Message } from "@whatschat/shared-types";
import type { ApiMessageLike, SocketMessagePayload } from "../domain";

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
  const byId = new Map<string, Message>();
  for (const m of api) byId.set(m.id, m);
  for (const m of live) {
    if (!byId.has(m.id)) byId.set(m.id, m);
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime()
  );
}
