import { EventEmitter } from "@whatschat/av-sdk-core";
import {
  ICodecManager,
  EncoderConfig,
  DecoderConfig,
  CodecState,
} from "@whatschat/av-sdk-codec";

export class CodecManager extends EventEmitter implements ICodecManager {
  private encoderState: CodecState = CodecState.Idle;
  private decoderState: CodecState = CodecState.Idle;
  private encoderConfig: EncoderConfig | null = null;
  private decoderConfig: DecoderConfig | null = null;

  async setEncoderConfig(config: EncoderConfig): Promise<void> {
    this.encoderConfig = config;
  }

  async setDecoderConfig(config: DecoderConfig): Promise<void> {
    this.decoderConfig = config;
  }

  async startEncoding(): Promise<void> {
    // TODO: Implement using native hardware encoder (MediaCodec / VideoToolbox)
    this.setEncoderState(CodecState.Encoding);
  }

  async stopEncoding(): Promise<void> {
    this.setEncoderState(CodecState.Idle);
  }

  async startDecoding(): Promise<void> {
    // TODO: Implement using native hardware decoder
    this.setDecoderState(CodecState.Decoding);
  }

  async stopDecoding(): Promise<void> {
    this.setDecoderState(CodecState.Idle);
  }

  async encodeVideoFrame(frame: VideoFrame): Promise<EncodedVideoChunk | null> {
    // TODO: Implement native video frame encoding
    return null;
  }

  async encodeAudioData(data: AudioData): Promise<EncodedAudioChunk | null> {
    // TODO: Implement native audio data encoding
    return null;
  }

  async decodeVideoChunk(chunk: EncodedVideoChunk): Promise<VideoFrame | null> {
    // TODO: Implement native video chunk decoding
    return null;
  }

  async decodeAudioChunk(chunk: EncodedAudioChunk): Promise<AudioData | null> {
    // TODO: Implement native audio chunk decoding
    return null;
  }

  getEncoderState(): CodecState {
    return this.encoderState;
  }

  getDecoderState(): CodecState {
    return this.decoderState;
  }

  async checkHardwareSupport(codec: string): Promise<boolean> {
    // TODO: Check hardware codec support using native APIs
    return false;
  }

  private setEncoderState(state: CodecState) {
    this.encoderState = state;
    this.emit("encoder-state-change", state);
  }

  private setDecoderState(state: CodecState) {
    this.decoderState = state;
    this.emit("decoder-state-change", state);
  }
}
