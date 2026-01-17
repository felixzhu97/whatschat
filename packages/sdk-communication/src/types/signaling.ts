/**
 * 信令消息类型定义
 */

export type SignalingMessageType =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "join-room"
  | "leave-room"
  | "error"
  | "room-joined"
  | "room-left"
  | "peer-joined"
  | "peer-left";

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId?: string;
  peerId?: string;
  data?: unknown;
  error?: string;
}

export interface OfferMessage extends SignalingMessage {
  type: "offer";
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage extends SignalingMessage {
  type: "answer";
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateMessage extends SignalingMessage {
  type: "ice-candidate";
  candidate: RTCIceCandidateInit;
}

export interface JoinRoomMessage extends SignalingMessage {
  type: "join-room";
  roomId: string;
  peerId: string;
}

export interface LeaveRoomMessage extends SignalingMessage {
  type: "leave-room";
  roomId: string;
  peerId: string;
}

export interface ErrorMessage extends SignalingMessage {
  type: "error";
  error: string;
}
