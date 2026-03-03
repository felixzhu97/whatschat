export interface EventContext {
  userId?: string;
  sessionId?: string;
  platform?: string;
}

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  context?: EventContext;
}

export type CustomEventPayload = {
  name: string;
  properties?: Record<string, unknown>;
};
