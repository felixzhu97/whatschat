import { EventEmitter } from "@whatschat/av-sdk-core";
import {
  IConnectionManager,
  ConnectionState,
  PeerConnection,
  ConnectionConfig,
} from "@whatschat/av-sdk-core";

export class ConnectionManager extends EventEmitter implements IConnectionManager {
  private state: ConnectionState = ConnectionState.Disconnected;
  private config: ConnectionConfig | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();

  async connect(config: ConnectionConfig): Promise<void> {
    this.config = config;
    this.setState(ConnectionState.Connecting);
    // TODO: Implement WebSocket connection
    this.setState(ConnectionState.Connected);
  }

  async disconnect(): Promise<void> {
    this.setState(ConnectionState.Disconnected);
    this.peerConnections.clear();
  }

  async joinRoom(roomId: string, peerId: string): Promise<void> {
    // TODO: Implement join room
  }

  async leaveRoom(): Promise<void> {
    // TODO: Implement leave room
  }

  async createPeerConnection(peerId: string): Promise<PeerConnection> {
    // TODO: Implement WebRTC peer connection creation
    const peerConnection: PeerConnection = {
      peerId,
      connection: null,
      state: "new" as const,
    };
    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  async closePeerConnection(peerId: string): Promise<void> {
    const peer = this.peerConnections.get(peerId);
    if (peer?.connection) {
      peer.connection.close();
    }
    this.peerConnections.delete(peerId);
  }

  getConnectionState(): ConnectionState {
    return this.state;
  }

  getPeerConnections(): Map<string, PeerConnection> {
    return this.peerConnections;
  }

  private setState(state: ConnectionState) {
    this.state = state;
    this.emit("connection-state-change", state);
  }
}
