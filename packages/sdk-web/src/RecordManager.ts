import { EventEmitter } from "@whatschat/sdk-communication";
import {
  IRecordManager,
  RecordingConfig,
  RecordingSegment,
} from "@whatschat/sdk-recording";

export class RecordManager extends EventEmitter implements IRecordManager {
  private recorder: MediaRecorder | null = null;
  private segments: RecordingSegment[] = [];

  async startRecording(
    stream: MediaStream,
    config?: RecordingConfig
  ): Promise<void> {
    const options: MediaRecorderOptions = {
      mimeType: config?.mimeType || "video/webm;codecs=vp8,opus",
      audioBitsPerSecond: config?.audioBitsPerSecond,
      videoBitsPerSecond: config?.videoBitsPerSecond,
      bitsPerSecond: config?.bitsPerSecond,
    };

    this.recorder = new MediaRecorder(stream, options);
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const segment: RecordingSegment = {
          id: `${Date.now()}-${Math.random()}`,
          startTime: Date.now(),
          endTime: Date.now(),
          blob: event.data,
        };
        this.segments.push(segment);
        this.emit("segment-created", segment);
      }
    };

    this.recorder.start();
    this.emit("recording-started");
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recorder) {
      throw new Error("No active recording");
    }

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];

      this.recorder!.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      this.recorder!.onstop = () => {
        const blob = new Blob(chunks, { type: this.recorder!.mimeType });
        this.emit("recording-stopped", blob);
        this.recorder = null;
        resolve(blob);
      };

      this.recorder!.onerror = (error) => {
        reject(error);
      };

      this.recorder!.stop();
    });
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
    return new Blob(blobs, { type: segments[0]?.blob.type || "video/webm" });
  }
}
