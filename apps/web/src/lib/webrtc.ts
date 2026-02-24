/**
 * WebRTC manager and types for real audio/video calls.
 * Re-exports from shared utils so hooks and components can use a single import path.
 */
export {
  getWebRTCManager,
  type RTCCallState,
} from "@/src/shared/utils/webrtc";
