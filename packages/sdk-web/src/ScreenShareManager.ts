import { EventEmitter } from "@whatschat/sdk-communication";
import {
  IScreenShareManager,
  ScreenShareConfig,
} from "@whatschat/sdk-recording";

export class ScreenShareManager extends EventEmitter implements IScreenShareManager {
  private screenStream: MediaStream | null = null;

  async startScreenShare(config?: ScreenShareConfig): Promise<MediaStream> {
    const options: DisplayMediaStreamConstraints = {
      audio: config?.audio || false,
      video: config?.video || true,
    };

    const stream = await navigator.mediaDevices.getDisplayMedia(options);
    this.screenStream = stream;

    stream.getVideoTracks()[0].onended = () => {
      this.stopScreenShare();
    };

    this.emit("screen-share-started", stream);
    return stream;
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
      this.emit("screen-share-stopped");
    }
  }

  isScreenSharing(): boolean {
    return this.screenStream !== null;
  }

  getScreenShareStream(): MediaStream | null {
    return this.screenStream;
  }

  async toggleScreenShare(
    config?: ScreenShareConfig
  ): Promise<MediaStream | null> {
    if (this.isScreenSharing()) {
      this.stopScreenShare();
      return null;
    } else {
      return this.startScreenShare(config);
    }
  }
}
