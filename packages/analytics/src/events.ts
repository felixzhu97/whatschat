export const PAGE_VIEW = "page_view";
export const CHAT_OPEN = "chat_open";
export const SEND_MESSAGE = "send_message";
export const CALL_START = "call_start";
export const CALL_END = "call_end";
export const EXPERIMENT_VIEWED = "experiment_viewed";
export const AI_ACTION = "ai_action";
export const POST_VIEW = "post_view";
export const POST_LIKE = "post_like";
export const POST_UNLIKE = "post_unlike";
export const POST_SAVE = "post_save";
export const POST_UNSAVE = "post_unsave";

export type KnownEventName =
  | typeof PAGE_VIEW
  | typeof CHAT_OPEN
  | typeof SEND_MESSAGE
  | typeof CALL_START
  | typeof CALL_END
  | typeof EXPERIMENT_VIEWED
  | typeof AI_ACTION
  | typeof POST_VIEW
  | typeof POST_LIKE
  | typeof POST_UNLIKE
  | typeof POST_SAVE
  | typeof POST_UNSAVE;

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

export type AiActionType = "text" | "image" | "video" | "voice";
export type AiActionStep = "open" | "generate_success" | "send_to_chat";

export interface AiActionPayload {
  action: AiActionType;
  step: AiActionStep;
  chatId?: string;
}

export interface PostViewPayload {
  postId: string;
  authorId?: string;
  durationMs?: number;
}

export interface PostLikePayload {
  postId: string;
}

export interface PostSavePayload {
  postId: string;
}

export type KnownEventPayload =
  | PageViewPayload
  | ChatOpenPayload
  | SendMessagePayload
  | CallStartPayload
  | CallEndPayload
  | ExperimentViewedPayload
  | AiActionPayload
  | PostViewPayload
  | PostLikePayload
  | PostSavePayload;

export type KnownEventPayloadMap = {
  [PAGE_VIEW]: PageViewPayload;
  [CHAT_OPEN]: ChatOpenPayload;
  [SEND_MESSAGE]: SendMessagePayload;
  [CALL_START]: CallStartPayload;
  [CALL_END]: CallEndPayload;
  [EXPERIMENT_VIEWED]: ExperimentViewedPayload;
  [AI_ACTION]: AiActionPayload;
  [POST_VIEW]: PostViewPayload;
  [POST_LIKE]: PostLikePayload;
  [POST_UNLIKE]: PostLikePayload;
  [POST_SAVE]: PostSavePayload;
  [POST_UNSAVE]: PostSavePayload;
};
