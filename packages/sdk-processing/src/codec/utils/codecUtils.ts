import { VideoCodec, AudioCodec, VideoEncoderConfig } from "../types";

/**
 * 验证编码器配置
 */
export function validateEncoderConfig(config: VideoEncoderConfig): boolean {
  if (!config.codec || !config.width || !config.height) {
    return false;
  }

  if (config.width <= 0 || config.height <= 0) {
    return false;
  }

  if (config.bitrate && config.bitrate <= 0) {
    return false;
  }

  if (config.frameRate && config.frameRate <= 0) {
    return false;
  }

  return true;
}

/**
 * 获取默认编码器配置
 */
export function getDefaultVideoEncoderConfig(): VideoEncoderConfig {
  return {
    codec: "h264",
    width: 1280,
    height: 720,
    bitrate: 2000000,
    frameRate: 30,
    hardwareAccelerated: true,
  };
}

/**
 * 检测支持的视频编码格式
 */
export async function detectSupportedVideoCodecs(): Promise<VideoCodec[]> {
  const codecs: VideoCodec[] = [];
  const testCodecs: VideoCodec[] = ["h264", "vp8", "vp9", "av1"];

  // 在 Web 环境中使用 MediaCapabilities API 检测
  if (typeof MediaCapabilities !== "undefined") {
    for (const codec of testCodecs) {
      try {
        const config = {
          type: "webrtc" as const,
          video: {
            contentType: `video/${codec}`,
            width: 1280,
            height: 720,
            bitrate: 2000000,
            framerate: 30,
          },
        };

        const result = await MediaCapabilities.decodingInfo(config);
        if (result.supported) {
          codecs.push(codec);
        }
      } catch {
        // 忽略不支持的情况
      }
    }
  }

  return codecs.length > 0 ? codecs : ["h264"]; // 默认返回 h264
}

/**
 * 检测支持的音频编码格式
 */
export async function detectSupportedAudioCodecs(): Promise<AudioCodec[]> {
  // 默认返回常见支持的格式
  return ["opus", "aac"];
}
