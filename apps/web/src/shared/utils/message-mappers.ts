import type { Message } from "../types";

export interface ApiMessageLike {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp?: string;
  type?: string;
  status?: string;
  createdAt?: string;
}

export interface SocketMessagePayload {
  from?: string;
  to?: string;
  data?: { id?: string; text?: string; type?: string };
  timestamp?: number;
}

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

export function mergeAndSortMessages(
  api: Message[],
  live: Message[]
): Message[] {
  const byId = new Map<string, Message>();
  for (const m of api) byId.set(m.id, m);
  for (const m of live) {
    if (!byId.has(m.id)) byId.set(m.id, m);
  }
  const timeMs = (t: string | Date | undefined) =>
    t == null ? 0 : new Date(t).getTime();
  return Array.from(byId.values()).sort(
    (a, b) => timeMs(a.timestamp) - timeMs(b.timestamp)
  );
}
