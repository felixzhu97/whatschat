import type { WebSocketMessage } from "./types";

export interface IWebSocketAdapter {
  send(message: WebSocketMessage): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  disconnect(): void;
  isConnected(): boolean;
  setSimulatedMode?(enabled: boolean): void;
}
