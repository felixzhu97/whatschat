export interface RTCCallState {
  isActive: boolean;
  isIncoming: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: "voice" | "video";
  status: "calling" | "ringing" | "connected" | "ended";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
}

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
  setSimulatedMode(enabled: boolean): void;
}

