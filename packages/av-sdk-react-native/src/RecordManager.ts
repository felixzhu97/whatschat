import { EventEmitter } from "@whatschat/av-sdk-core";
import {
  IRecordManager,
  RecordingConfig,
  RecordingSegment,
} from "@whatschat/av-sdk-core";

export class RecordManager extends EventEmitter implements IRecordManager {
  private recorder: MediaRecorder | null = null;
  private segments: RecordingSegment[] = [];

  async startRecording(
    stream: MediaStream,
    config?: RecordingConfig
  ): Promise<void> {
    // TODO: Implement using react-native-webrtc recording API
    throw new Error("Not implemented");
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recorder) {
      throw new Error("No active recording");
    }
    // TODO: Implement stop recording
    throw new Error("Not implemented");
  }

  pauseRecording(): void {
    if (this.recorder && this.getRecordingState() === "recording") {
      this.recorder.pause();
      this.emit("recording-paused");
    }
  }

  resumeRecording(): void {
    if (this.recorder && this.getRecordingState() === "paused") {
      this.recorder.resume();
      this.emit("recording-resumed");
    }
  }

  getRecordingState(): "inactive" | "recording" | "paused" {
    if (!this.recorder) {
      return "inactive";
    }
    return this.recorder.state as "inactive" | "recording" | "paused";
  }

  getSegments(): RecordingSegment[] {
    return this.segments;
  }

  async mergeSegments(segments: RecordingSegment[]): Promise<Blob> {
    const blobs = segments.map((s) => s.blob);
    return new Blob(blobs, { type: segments[0]?.blob.type || "video/mp4" });
  }
}
