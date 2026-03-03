import type { AnalyticsEvent, EventContext } from "./types";
import type { KnownEventName, KnownEventPayloadMap } from "./events";
import type { IAnalyticsTransport } from "./transport";

export interface AnalyticsConfig {
  transport: IAnalyticsTransport;
  defaultContext?: EventContext;
}

export interface IAnalyticsClient {
  track(name: KnownEventName, payload?: KnownEventPayloadMap[KnownEventName]): void;
  track(name: string, properties?: Record<string, unknown>): void;
  identify(userId: string): void;
  setContext(ctx: Partial<EventContext>): void;
}

export function createAnalytics(config: AnalyticsConfig): IAnalyticsClient {
  let context: EventContext = { ...config.defaultContext };

  function buildEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): AnalyticsEvent {
    return {
      eventName,
      properties,
      timestamp: Date.now(),
      context: Object.keys(context).length ? context : undefined,
    };
  }

  function track(
    name: KnownEventName | string,
    payload?: Record<string, unknown>
  ): void {
    const event = buildEvent(name, payload);
    config.transport.send([event]);
  }

  function identify(userId: string): void {
    context = { ...context, userId };
  }

  function setContext(ctx: Partial<EventContext>): void {
    context = { ...context, ...ctx };
  }

  return { track, identify, setContext };
}
