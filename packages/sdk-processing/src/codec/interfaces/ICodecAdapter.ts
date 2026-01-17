import { EncoderConfig, DecoderConfig } from "../types";

/**
 * 编码解码适配器接口
 */
export interface ICodecAdapter {
  /**
   * 初始化编码器
   */
  initializeEncoder(config: EncoderConfig): Promise<void>;

  /**
   * 初始化解码器
   */
  initializeDecoder(config: DecoderConfig): Promise<void>;

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
   * 释放资源
   */
  release(): Promise<void>;

  /**
   * 检查硬件支持
   */
  isHardwareAccelerated(): boolean;
}
