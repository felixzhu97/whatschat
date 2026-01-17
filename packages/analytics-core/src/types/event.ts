/**
 * 事件追踪类型定义
 */

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface EventContext {
  page?: {
    path: string;
    title: string;
    referrer?: string;
  };
  device?: {
    type: string;
    os?: string;
    browser?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties?: EventProperties;
  context?: EventContext;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export type EventCallback = (event: AnalyticsEvent) => void | Promise<void>;

export interface EventQueueConfig {
  maxSize?: number;
  flushInterval?: number;
  batchSize?: number;
}
