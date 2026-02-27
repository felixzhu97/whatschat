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
