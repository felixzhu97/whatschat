/**
 * 连接状态类型定义
 */

export enum ConnectionState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Reconnecting = "reconnecting",
  Failed = "failed",
}

export enum IceConnectionState {
  New = "new",
  Checking = "checking",
  Connected = "connected",
  Completed = "completed",
  Failed = "failed",
  Disconnected = "disconnected",
  Closed = "closed",
}

export enum PeerConnectionState {
  New = "new",
  Connecting = "connecting",
  Connected = "connected",
  Disconnected = "disconnected",
  Failed = "failed",
  Closed = "closed",
}

export interface ConnectionConfig {
  signalingUrl: string;
  roomId?: string;
  peerId?: string;
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection | null;
  state: PeerConnectionState;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}
