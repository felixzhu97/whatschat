"use client";

import {
  IWebSocketAdapter,
  WebSocketMessage,
} from "../../../domain/interfaces/adapters/websocket.interface";
import { io, Socket } from "socket.io-client";

type WebSocketMode = "socketio" | "apigateway" | "simulated";

const SOCKET_DEBUG = process.env.NEXT_PUBLIC_SOCKET_DEBUG === "true";

function logSocket(...args: any[]) {
  if (!SOCKET_DEBUG) return;
  //统一前缀，方便在控制台过滤
  console.log("[WS]", ...args);
}

export class WebSocketAdapter implements IWebSocketAdapter {
  // Native WebSocket connection (for API Gateway or basic WS)
  private ws: WebSocket | null = null;
  // Socket.IO connection (for NestJS ChatGateway)
  private ioSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private mode: WebSocketMode = "simulated";
  private apiGatewayEndpoint: string | null = null;
  private connectionId: string | null = null;

  constructor() {
    // Determine connection mode from environment or config
    const wsMode = (process.env.NEXT_PUBLIC_WEBSOCKET_MODE || "simulated") as WebSocketMode;
    this.mode = wsMode;
    this.apiGatewayEndpoint = process.env.NEXT_PUBLIC_API_GATEWAY_WEBSOCKET_ENDPOINT || null;

    logSocket("init adapter", { mode: this.mode, apiGatewayEndpoint: this.apiGatewayEndpoint });

    if (this.mode === "simulated") {
      this.simulateConnection();
    } else if (this.mode === "apigateway" && this.apiGatewayEndpoint) {
      this.connectToApiGateway();
    } else {
      this.connect();
    }
  }

  private simulateConnection() {
    setTimeout(() => {
      logSocket("simulated connection established");
      this.emit("connected", null);
    }, 1000);

    setInterval(() => {
      if (Math.random() > 0.95) {
        this.simulateIncomingMessage();
      }
    }, 2000);
  }

  private simulateIncomingMessage() {
    const mockMessages = [
      "Hi! How are you recently?",
      "Nice weather today.",
      "Do you have time to grab a meal?",
      "How is work going?",
      "Any plans for the weekend?",
    ];

    const randomMessage =
      mockMessages[Math.floor(Math.random() * mockMessages.length)];

    const simulatedMessage: WebSocketMessage = {
      type: "message",
      from: "simulated_user",
      data: {
        id: Date.now().toString(),
        text: randomMessage,
          type: "text",
      },
      timestamp: Date.now(),
    };

    this.handleMessage(simulatedMessage);
  }

  private connectToApiGateway() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (!this.apiGatewayEndpoint) {
      logSocket("API Gateway WebSocket endpoint not configured, fallback to simulated");
      this.mode = "simulated";
      this.simulateConnection();
      return;
    }

    this.isConnecting = true;

    try {
      // Get JWT token from localStorage or auth context
      const token = this.getAuthToken();
      if (!token) {
        logSocket("no auth token, fallback to simulated");
        this.mode = "simulated";
        this.simulateConnection();
        return;
      }

      // Connect to API Gateway WebSocket with token
      const wsUrl = `${this.apiGatewayEndpoint}?token=${encodeURIComponent(token)}`;
      logSocket("connecting to API Gateway WS", { wsUrl });
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        logSocket("API Gateway WS connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Extract connection ID from WebSocket URL if available
        // Note: API Gateway provides connection ID in the response
        this.emit("connected", { mode: this.mode, connectionId: this.connectionId });
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          let message: WebSocketMessage;

          if (typeof event.data === "string") {
            if (event.data.startsWith("{") || event.data.startsWith("[")) {
              const parsed = JSON.parse(event.data);

              // Handle API Gateway message format
              if (this.mode === "apigateway" && parsed.type) {
                message = {
                  type: parsed.type,
                  from: parsed.from || parsed.userId || "server",
                  data: parsed.data || parsed,
                  timestamp: parsed.timestamp || Date.now(),
                };
              } else {
                message = parsed;
              }
            } else {
              message = {
                type: "message",
                data: {
                  text: event.data,
                  type: "text",
                  id: Date.now().toString(),
                },
                from: this.mode === "apigateway" ? "server" : "echo_server",
                timestamp: Date.now(),
              };
            }
          } else {
            logSocket("API Gateway WS received binary data", event.data);
            return;
          }

          this.handleMessage(message);
        } catch (error) {
          logSocket("API Gateway WS parse message failed, using raw data", {
            error,
            raw: event.data,
          });

          const fallbackMessage: WebSocketMessage = {
            type: "message",
            data: {
              text: String(event.data).substring(0, 100),
              type: "text",
              id: Date.now().toString(),
            },
            from: "server",
            timestamp: Date.now(),
          };

          this.handleMessage(fallbackMessage);
        }
      };

      this.ws.onclose = (event) => {
        logSocket("API Gateway WS closed", { code: event.code, reason: event.reason });
        this.isConnecting = false;
        this.ws = null;
        this.emit("disconnected", null);

        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        logSocket("API Gateway WS error", error);
        this.isConnecting = false;
        this.emit("error", error);
      };
    } catch (error) {
      logSocket("API Gateway WS connect failed", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logSocket(
        "attempt reconnect",
        `${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
        { mode: this.mode },
      );

      setTimeout(() => {
        if (this.mode === "simulated") {
          this.simulateConnection();
        } else if (this.mode === "apigateway") {
          this.connectToApiGateway();
        } else {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      logSocket("reconnect failed, switch to simulated mode");
      this.mode = "simulated";
      this.simulateConnection();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    logSocket("dispatch message to listeners", message.type, message);
    this.emit(message.type, message);
  }

  private sendMessage(message: WebSocketMessage) {
    // If using Socket.IO, map high-level events to backend events
    if (this.mode === "socketio" && this.ioSocket && this.ioSocket.connected) {
      try {
        this.sendViaSocketIo(message);
      } catch (error) {
        logSocket("Socket.IO send failed, queue message", { error, message });
        this.messageQueue.push(message);
      }
      return;
    }

    // Fallback: native WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        logSocket("WS send", message);
        this.ws.send(
          JSON.stringify({
            ...message,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        logSocket("WS send failed, queue message", { error, message });
        this.messageQueue.push(message);
      }
    } else {
      logSocket("WS not connected, queue message", message);
      this.messageQueue.push(message);
    }
  }

  private connect() {
    // When using Socket.IO mode, use socket.io-client to connect to NestJS ChatGateway
    if (this.mode === "socketio") {
      if (this.ioSocket && this.ioSocket.connected) {
        logSocket("Socket.IO already connected");
        return;
      }

      if (this.isConnecting) {
        logSocket("Socket.IO is connecting, skip duplicate connect");
        return;
      }

      this.isConnecting = true;

      const socketIoUrl =
        process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:3000";
      const token = this.getAuthToken();
      logSocket("Socket.IO connect", { socketIoUrl, hasToken: !!token });

      this.ioSocket = io(socketIoUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        auth: token ? { token } : undefined,
      });

      this.ioSocket.on("connect", () => {
        logSocket("Socket.IO connected", this.ioSocket?.id, { mode: this.mode });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit("connected", { mode: this.mode });
        this.flushMessageQueue();
      });

      this.ioSocket.on("disconnect", (reason) => {
        logSocket("Socket.IO disconnected", reason);
        this.emit("disconnected", null);
      });

      this.ioSocket.on("connect_error", (error) => {
        logSocket("Socket.IO connect error", error);
        this.isConnecting = false;
        this.attemptReconnect();
      });

      // Map backend Socket.IO events to high-level WebSocketMessage
      this.ioSocket.on("message:received", (data: any) => {
        logSocket("Socket.IO event message:received", data);
        const message: WebSocketMessage = {
          type: "message",
          from: data.senderId,
          to: data.chatId,
          data: {
            id: data.id,
            text: data.content,
            type: (data.type || "TEXT").toString().toLowerCase(),
            mediaUrl: data.mediaUrl,
          },
          timestamp: new Date(data.createdAt || Date.now()).getTime(),
        };
        this.handleMessage(message);
      });

      this.ioSocket.on(
        "message:typing",
        (payload: { chatId: string; userId: string; isTyping: boolean }) => {
          logSocket("Socket.IO event message:typing", payload);
          const typingMessage: WebSocketMessage = {
            type: "typing",
            from: payload.userId,
            to: payload.chatId,
            data: { isTyping: payload.isTyping },
            timestamp: Date.now(),
          };
          this.handleMessage(typingMessage);
        },
      );

      this.ioSocket.on(
        "message:read",
        (payload: { messageId: string; userId: string }) => {
          logSocket("Socket.IO event message:read", payload);
          // Expose as a generic message_status event so existing hooks can reuse it
          this.emit("message_status", {
            messageId: payload.messageId,
            status: "read",
          });
        },
      );

      return;
    }

    // Default: plain WebSocket echo server (mainly for demos)
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    try {
      const socketWsUrl =
        process.env.NEXT_PUBLIC_SOCKET_IO_URL || "ws://localhost:3001";
      logSocket("basic WS connect", { socketWsUrl });
      this.ws = new WebSocket(socketWsUrl);

      this.ws.onopen = () => {
        logSocket("basic WS connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit("connected", { mode: this.mode });
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          let message: WebSocketMessage;

          if (typeof event.data === "string") {
            if (event.data.startsWith("{") || event.data.startsWith("[")) {
              message = JSON.parse(event.data);
            } else {
              message = {
                type: "message",
                data: {
                  text: event.data,
                  type: "text",
                  id: Date.now().toString(),
                },
                from: "server",
                timestamp: Date.now(),
              };
            }
          } else {
            logSocket("basic WS received binary data", event.data);
            return;
          }

          this.handleMessage(message);
        } catch (error) {
          logSocket("basic WS parse message failed, using raw data", {
            error,
            raw: event.data,
          });
          const fallbackMessage: WebSocketMessage = {
            type: "message",
            data: {
              text: String(event.data).substring(0, 100),
              type: "text",
              id: Date.now().toString(),
            },
            from: "server",
            timestamp: Date.now(),
          };
          this.handleMessage(fallbackMessage);
        }
      };

      this.ws.onclose = (event) => {
        logSocket("basic WS closed", { code: event.code, reason: event.reason });
        this.isConnecting = false;
        this.ws = null;
        this.emit("disconnected", null);

        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        logSocket("basic WS error", error);
        this.isConnecting = false;
        this.emit("error", error);
      };
    } catch (error) {
      logSocket("basic WS connect failed", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private getAuthToken(): string | null {
    // Try to get token from localStorage or auth context
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token")
      );
    }
    return null;
  }

  send(message: WebSocketMessage): void {
    if (this.mode === "simulated") {
      logSocket("simulated send", message);

      setTimeout(() => {
        if (message.type === "message") {
          this.emit("message_status", {
            messageId: message.data.id,
            status: "delivered",
          });

          setTimeout(() => {
            this.emit("message_status", {
              messageId: message.data.id,
              status: "read",
            });
          }, 2000);
        }
      }, 500);

      if (message.type === "message" && Math.random() > 0.7) {
        setTimeout(
          () => {
            this.simulateResponse(message);
          },
          1000 + Math.random() * 3000
        );
      }
    } else {
      this.sendMessage(message);
    }
  }

  private simulateResponse(originalMessage: WebSocketMessage) {
    const responses = [
      "Got it!",
      "Okay, I see.",
      "No problem.",
      "Let me think about it...",
      "That sounds like a good idea.",
      "I agree with you.",
      "Hold on, I will check.",
      "Understood.",
      "Thanks for your message.",
      "Let us talk later.",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const responseMessage: WebSocketMessage = {
      type: "message",
      from: originalMessage.to || "simulated_contact",
      data: {
        id: Date.now().toString(),
        text: randomResponse,
        type: "text",
      },
      timestamp: Date.now(),
    };

    this.handleMessage(responseMessage);
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  disconnect(): void {
    if (this.ioSocket) {
      this.ioSocket.disconnect();
      this.ioSocket = null;
    }
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  isConnected(): boolean {
    if (this.mode === "simulated") {
      return true;
    }
    if (this.mode === "socketio") {
      return this.ioSocket !== null && this.ioSocket.connected;
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  setSimulatedMode(enabled: boolean): void {
    this.mode = enabled ? "simulated" : "socketio";
    if (enabled) {
      this.disconnect();
      this.simulateConnection();
    } else {
      this.connect();
    }
  }

  setMode(mode: WebSocketMode): void {
    this.disconnect();
    this.mode = mode;
    if (mode === "simulated") {
      this.simulateConnection();
    } else if (mode === "apigateway") {
      this.connectToApiGateway();
    } else {
      this.connect();
    }
  }

  getMode(): WebSocketMode {
    return this.mode;
  }
}

// 单例模式
let wsManager: WebSocketAdapter | null = null;

export const getWebSocketAdapter = (): IWebSocketAdapter => {
  if (!wsManager) {
    wsManager = new WebSocketAdapter();
  }
  return wsManager;
};
