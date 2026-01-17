import { EncoderConfig, DecoderConfig, CodecState } from "../types";

/**
 * 编码解码管理器接口
 */
export interface ICodecManager {
  /**
   * 设置编码器配置
   */
  setEncoderConfig(config: EncoderConfig): Promise<void>;

  /**
   * 设置解码器配置
   */
  setDecoderConfig(config: DecoderConfig): Promise<void>;

  /**
   * 开始编码
   */
  startEncoding(): Promise<void>;

  /**
   * 停止编码
   */
  stopEncoding(): Promise<void>;

  /**
   * 开始解码
   */
  startDecoding(): Promise<void>;

  /**
   * 停止解码
   */
  stopDecoding(): Promise<void>;

  /**
   * 编码视频帧
   */
  encodeVideoFrame(frame: VideoFrame): Promise<EncodedVideoChunk | null>;

  /**
   * 编码音频数据
   */
  encodeAudioData(data: AudioData): Promise<EncodedAudioChunk | null>;

  /**
   * 解码视频块
   */
  decodeVideoChunk(chunk: EncodedVideoChunk): Promise<VideoFrame | null>;

  /**
   * 解码音频块
   */
  decodeAudioChunk(chunk: EncodedAudioChunk): Promise<AudioData | null>;

  /**
   * 获取编码器状态
   */
  getEncoderState(): CodecState;

  /**
   * 获取解码器状态
   */
  getDecoderState(): CodecState;

  /**
   * 检查硬件编码支持
   */
  checkHardwareSupport(codec: string): Promise<boolean>;

  /**
   * 事件监听
   */
  on(event: "encoder-state-change", handler: (state: CodecState) => void): void;
  on(event: "decoder-state-change", handler: (state: CodecState) => void): void;
  on(event: "error", handler: (error: Error) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
