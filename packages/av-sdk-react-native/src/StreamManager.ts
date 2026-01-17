import { EventEmitter } from "@whatschat/av-sdk-core";
import { IStreamManager } from "@whatschat/av-sdk-core";

export class StreamManager extends EventEmitter implements IStreamManager {
  private remoteStreams: Map<string, MediaStream> = new Map();

  async pushLocalStream(peerId: string, stream: MediaStream): Promise<void> {
    // TODO: Implement push local stream to peer connection
  }

  async pullRemoteStream(peerId: string): Promise<MediaStream | null> {
    return this.remoteStreams.get(peerId) || null;
  }

  addRemoteStream(peerId: string, stream: MediaStream): void {
    this.remoteStreams.set(peerId, stream);
    this.emit("stream-added", peerId, stream);
  }

  removeRemoteStream(peerId: string): void {
    const stream = this.remoteStreams.get(peerId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.remoteStreams.delete(peerId);
      this.emit("stream-removed", peerId);
    }
  }

  getRemoteStream(peerId: string): MediaStream | null {
    return this.remoteStreams.get(peerId) || null;
  }

  getAllRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }
}
