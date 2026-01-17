/**
 * SDK 错误类
 */
export class AVSDKError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "AVSDKError";
    Object.setPrototypeOf(this, AVSDKError.prototype);
  }
}

export class ConnectionError extends AVSDKError {
  constructor(message: string, cause?: Error) {
    super(message, "CONNECTION_ERROR", cause);
    this.name = "ConnectionError";
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class MediaError extends AVSDKError {
  constructor(message: string, cause?: Error) {
    super(message, "MEDIA_ERROR", cause);
    this.name = "MediaError";
    Object.setPrototypeOf(this, MediaError.prototype);
  }
}

export class SignalingError extends AVSDKError {
  constructor(message: string, cause?: Error) {
    super(message, "SIGNALING_ERROR", cause);
    this.name = "SignalingError";
    Object.setPrototypeOf(this, SignalingError.prototype);
  }
}
