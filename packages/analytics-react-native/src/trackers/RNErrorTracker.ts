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
 * React Native 平台错误追踪器
 */
export class RNErrorTracker implements IErrorTracker {
  private errors: ErrorEvent[] = [];
  private callbacks: Set<ErrorCallback> = new Set();
  private isTracking: boolean = false;
  private originalErrorHandler?: (error: Error, isFatal?: boolean) => void;

  constructor() {
    // React Native 使用 ErrorUtils 来处理全局错误
  }

  start(): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;

    // React Native 的全局错误处理
    // 需要根据实际环境来判断是否可以使用 ErrorUtils
    if (
      typeof ErrorUtils !== "undefined" &&
      ErrorUtils.setGlobalHandler
    ) {
      this.originalErrorHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler(this.handleError.bind(this));
    }

    // 监听 Promise rejection
    // React Native 使用 global 对象
    if (typeof globalThis !== "undefined") {
      const globalObj = globalThis as any;
      const originalUnhandledRejection = globalObj.onunhandledrejection;
      globalObj.onunhandledrejection = (event: any) => {
        this.handleUnhandledRejection(event);
        if (originalUnhandledRejection) {
          originalUnhandledRejection(event);
        }
      };
    }
  }

  stop(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;

    // 恢复原始错误处理
    if (
      typeof ErrorUtils !== "undefined" &&
      ErrorUtils.setGlobalHandler &&
      this.originalErrorHandler
    ) {
      ErrorUtils.setGlobalHandler(this.originalErrorHandler);
    }
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

  captureCustomError(
    message: string,
    context?: Record<string, unknown>
  ): void {
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

  private handleError(error: Error, isFatal?: boolean): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      error,
      context: {
        isFatal,
      },
    };

    const errorEvent = this.createErrorEvent(ErrorType.JavaScript, errorInfo);
    this.addError(errorEvent);
    this.notifyCallbacks(errorEvent);

    // 调用原始错误处理
    if (this.originalErrorHandler) {
      this.originalErrorHandler(error, isFatal);
    }
  }

  private handleUnhandledRejection(event: { reason?: unknown }): void {
    const error = event.reason instanceof Error ? (event.reason as Error) : undefined;
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

// TypeScript 类型声明（用于 ErrorUtils）
declare global {
  const ErrorUtils: {
    getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
    setGlobalHandler(handler: (error: Error, isFatal?: boolean) => void): void;
  } | undefined;
}
