export const PAGE_VIEW = "page_view";
export const CHAT_OPEN = "chat_open";
export const SEND_MESSAGE = "send_message";
export const CALL_START = "call_start";
export const CALL_END = "call_end";
export const EXPERIMENT_VIEWED = "experiment_viewed";

export type KnownEventName =
  | typeof PAGE_VIEW
  | typeof CHAT_OPEN
  | typeof SEND_MESSAGE
  | typeof CALL_START
  | typeof CALL_END
  | typeof EXPERIMENT_VIEWED;

export interface PageViewPayload {
  path?: string;
  title?: string;
}

export interface ChatOpenPayload {
  chatId: string;
  chatType?: string;
}

export interface SendMessagePayload {
  chatId: string;
  type?: string;
}

export interface CallStartPayload {
  chatId?: string;
  callType?: string;
}

export interface CallEndPayload {
  chatId?: string;
  callType?: string;
  duration?: number;
}

export interface ExperimentViewedPayload {
  experiment_id: string;
  variation_id: string;
}

export type KnownEventPayload =
  | PageViewPayload
  | ChatOpenPayload
  | SendMessagePayload
  | CallStartPayload
  | CallEndPayload
  | ExperimentViewedPayload;

export type KnownEventPayloadMap = {
  [PAGE_VIEW]: PageViewPayload;
  [CHAT_OPEN]: ChatOpenPayload;
  [SEND_MESSAGE]: SendMessagePayload;
  [CALL_START]: CallStartPayload;
  [CALL_END]: CallEndPayload;
  [EXPERIMENT_VIEWED]: ExperimentViewedPayload;
};
