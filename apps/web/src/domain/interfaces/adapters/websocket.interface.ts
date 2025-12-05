export interface WebSocketMessage {
  type:
    | "message"
    | "typing"
    | "call_offer"
    | "call_answer"
    | "call_ice_candidate"
    | "call_end"
    | "user_status"
    | "message_read";
  data: any;
  from?: string;
  to?: string;
  timestamp?: number;
}

export interface IWebSocketAdapter {
  send(message: WebSocketMessage): void;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  disconnect(): void;
  isConnected(): boolean;
  setSimulatedMode(enabled: boolean): void;
}

