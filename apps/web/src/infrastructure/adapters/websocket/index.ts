export * from "./webrtc.adapter";
export { getWebSocketAdapter } from "./websocket.adapter";
// Backwards-compatible alias used by hooks like use-real-chat / webrtc utils
export { getWebSocketAdapter as getWebSocketManager } from "./websocket.adapter";

