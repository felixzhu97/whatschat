/**
 * 媒体配置类型定义
 */

export interface MediaConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export interface VideoConstraints extends MediaTrackConstraints {
  width?: number | ConstrainULong;
  height?: number | ConstrainULong;
  frameRate?: number | ConstrainDouble;
  facingMode?: ConstrainDOMString;
}

export interface AudioConstraints extends MediaTrackConstraints {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number | ConstrainULong;
  channelCount?: number | ConstrainULong;
}

export interface MediaConfig {
  audio?: AudioConstraints;
  video?: VideoConstraints;
}

export interface MediaStreamConfig {
  audio?: boolean | AudioConstraints;
  video?: boolean | VideoConstraints;
}

export type MediaDeviceType = "audioinput" | "audiooutput" | "videoinput";

export interface MediaDeviceInfo {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
  groupId: string;
}

export interface MediaTrackSettings {
  deviceId?: string;
  groupId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  aspectRatio?: number;
  facingMode?: string;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  channelCount?: number;
}
