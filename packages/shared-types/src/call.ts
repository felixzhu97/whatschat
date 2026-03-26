export type CallType = "voice" | "video";

export type CallStatus =
  | "incoming"
  | "outgoing"
  | "missed"
  | "answered"
  | "ended"
  | "declined"
  | "busy"
  | "failed";

export interface Call {
  id: string;
  contactId?: string;
  contactName?: string;
  contactAvatar?: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  receiverId?: string;
  receiverName?: string;
  receiverAvatar?: string;
  type: CallType;
  status: CallStatus;
  timestamp?: Date | string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  isGroup?: boolean;
  isGroupCall?: boolean;
  participants?: string[];
  roomId?: string;
  metadata?: Record<string, unknown>;
}
