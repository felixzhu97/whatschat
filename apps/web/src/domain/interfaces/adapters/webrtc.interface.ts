import type { RTCCallState } from "@whatschat/im";

export type { RTCCallState };

export interface IWebRTCAdapter {
  startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video"
  ): Promise<void>;
  answerCall(): Promise<void>;
  endCall(): void;
  toggleMute(): void;
  toggleVideo(): void;
  toggleSpeaker(): void;
  getCallState(): RTCCallState;
  getLocalStream(): MediaStream | null;
  getRemoteStream(): MediaStream | null;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}

