import { EventEmitter } from "@whatschat/av-sdk-core";
import {
  IScreenShareManager,
  ScreenShareConfig,
} from "@whatschat/av-sdk-core";

export class ScreenShareManager extends EventEmitter implements IScreenShareManager {
  private screenStream: MediaStream | null = null;

  async startScreenShare(config?: ScreenShareConfig): Promise<MediaStream> {
    // TODO: Implement using React Native screen capture API (Android/iOS specific)
    throw new Error("Not implemented");
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
