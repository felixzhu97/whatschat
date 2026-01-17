import {
  IErrorTracker,
  ErrorEvent,
  ErrorInfo,
  ErrorType,
  ErrorCallback,
} from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";
import { generateId } from "@whatschat/analytics-core";

/**
 * Web 平台错误追踪器
 */
export class WebErrorTracker implements IErrorTracker {
  private errors: ErrorEvent[] = [];
  private callbacks: Set<ErrorCallback> = new Set();
  private isTracking: boolean = false;
  private originalOnError?: OnErrorEventHandler | null;
  private originalOnUnhandledRejection?:
    | ((event: PromiseRejectionEvent) => void)
    | null;
  private onErrorHandler!: OnErrorEventHandler;
  private onUnhandledRejectionHandler!: (event: PromiseRejectionEvent) => void;

  constructor() {
    this.onErrorHandler = this.handleError.bind(this) as OnErrorEventHandler;
    this.onUnhandledRejectionHandler = this.handleUnhandledRejection.bind(
      this
    ) as (event: PromiseRejectionEvent) => void;
  }

  start(): void {
    if (this.isTracking) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    this.isTracking = true;

    // 保存原始错误处理
    this.originalOnError = window.onerror;
    this.originalOnUnhandledRejection = window.onunhandledrejection || null;

    // 绑定错误处理
    window.onerror = this.onErrorHandler;
    // 使用 addEventListener 监听 unhandledrejection
    window.addEventListener(
      "unhandledrejection",
      this.onUnhandledRejectionHandler
    );
  }

  stop(): void {
    if (!this.isTracking) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    this.isTracking = false;

    // 恢复原始错误处理
    window.onerror = this.originalOnError ?? null;
    window.removeEventListener(
      "unhandledrejection",
      this.onUnhandledRejectionHandler
    );
  }

  captureError(
    error: Error | ErrorInfo,
    context?: Record<string, unknown>
  ): void {
    const errorInfo: ErrorInfo =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            error,
          }
        : error;

    const errorEvent = this.createErrorEvent(
      ErrorType.JavaScript,
      errorInfo,
      context
    );

    this.addError(errorEvent);
    this.notifyCallbacks(errorEvent);
  }

  captureCustomError(message: string, context?: Record<string, unknown>): void {
    const errorInfo: ErrorInfo = {
      message,
      context,
    };

    const errorEvent = this.createErrorEvent(
      ErrorType.Custom,
      errorInfo,
      context
    );

    this.addError(errorEvent);
    this.notifyCallbacks(errorEvent);
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  onError(callback: ErrorCallback): void {
    this.callbacks.add(callback);
  }

  offError(callback: ErrorCallback): void {
    this.callbacks.delete(callback);
  }

  private handleError: OnErrorEventHandler = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => {
    // 处理不同类型 message（可能是 string 或 Event）
    const messageStr =
      typeof message === "string" ? message : message?.type || "Unknown error";
    const errorInfo: ErrorInfo = {
      message: error?.message || messageStr,
      stack: error?.stack,
      filename: typeof source === "string" ? source : undefined,
      lineno,
      colno,
      error,
    };

    const errorEvent = this.createErrorEvent(ErrorType.JavaScript, errorInfo);
    this.addError(errorEvent);
    this.notifyCallbacks(errorEvent);

    // 调用原始错误处理
    if (this.originalOnError) {
      const result = this.originalOnError(
        message,
        source,
        lineno,
        colno,
        error
      );
      return result === true;
    }

    return false;
  };

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : undefined;
    const message =
      error?.message || String(event.reason) || "Unhandled Promise Rejection";

    const errorInfo: ErrorInfo = {
      message,
      stack: error?.stack,
      error,
      context: {
        reason: event.reason,
      },
    };

    const errorEvent = this.createErrorEvent(
      ErrorType.PromiseRejection,
      errorInfo
    );
    this.addError(errorEvent);
    this.notifyCallbacks(errorEvent);
  }

  private createErrorEvent(
    type: ErrorType,
    error: ErrorInfo,
    context?: Record<string, unknown>
  ): ErrorEvent {
    const session = useAnalyticsStore.getState().currentSession;
    const userId = useAnalyticsStore.getState().userId;

    return {
      id: generateId(),
      type,
      error: {
        ...error,
        context: {
          ...error.context,
          ...context,
        },
      },
      timestamp: Date.now(),
      sessionId: session?.id || "",
      userId,
      page:
        typeof window !== "undefined" ? window.location.pathname : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };
  }

  private addError(errorEvent: ErrorEvent): void {
    this.errors.push(errorEvent);

    // 限制错误数量
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  private notifyCallbacks(errorEvent: ErrorEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(errorEvent);
      } catch (error) {
        console.error("Error callback error:", error);
      }
    });
  }

  destroy(): void {
    this.stop();
    this.callbacks.clear();
    this.clearErrors();
  }
}
