/**
 * 编码解码配置类型定义
 */

export type VideoCodec = "h264" | "vp8" | "vp9" | "av1" | "hevc";
export type AudioCodec = "opus" | "aac" | "pcm";

export interface Resolution {
  width: number;
  height: number;
}

export interface VideoEncoderConfig {
  codec: VideoCodec;
  width: number;
  height: number;
  bitrate?: number;
  frameRate?: number;
  hardwareAccelerated?: boolean;
  keyInterval?: number;
  profile?: string;
  level?: string;
}

export interface AudioEncoderConfig {
  codec: AudioCodec;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  hardwareAccelerated?: boolean;
}

export interface EncoderConfig {
  video?: VideoEncoderConfig;
  audio?: AudioEncoderConfig;
}

export interface VideoDecoderConfig {
  codec: VideoCodec;
  hardwareAccelerated?: boolean;
}

export interface AudioDecoderConfig {
  codec: AudioCodec;
  hardwareAccelerated?: boolean;
}

export interface DecoderConfig {
  video?: VideoDecoderConfig;
  audio?: AudioDecoderConfig;
}

export enum CodecState {
  Idle = "idle",
  Encoding = "encoding",
  Decoding = "decoding",
  Error = "error",
}
