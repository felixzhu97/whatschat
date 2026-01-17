import { EventEmitter } from "@whatschat/sdk-communication";
import {
  IMediaManager,
  MediaStreamConfig,
  MediaDeviceInfo,
} from "@whatschat/sdk-media";

export class MediaManager extends EventEmitter implements IMediaManager {
  private localStream: MediaStream | null = null;

  async getUserMedia(config: MediaStreamConfig): Promise<MediaStream> {
    // TODO: Implement using react-native-webrtc
    // const { mediaDevices } = require('react-native-webrtc');
    // const stream = await mediaDevices.getUserMedia(config);
    throw new Error("Not implemented");
  }

  stopMediaStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
    if (this.localStream === stream) {
      this.localStream = null;
    }
  }

  async getDevices(): Promise<MediaDeviceInfo[]> {
    // TODO: Implement using react-native-webrtc
    return [];
  }

  async switchAudioInput(deviceId: string): Promise<void> {
    // TODO: Implement audio device switching
    this.emit("device-changed");
  }

  async switchVideoInput(deviceId: string): Promise<void> {
    // TODO: Implement video device switching
    this.emit("device-changed");
  }

  toggleMute(): boolean {
    if (!this.localStream) {
      return false;
    }
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muted = !audioTrack.enabled;
      this.emit("mute-changed", muted);
      return muted;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.localStream) {
      return false;
    }
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const enabled = videoTrack.enabled;
      this.emit("video-changed", enabled);
      return enabled;
    }
    return false;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
