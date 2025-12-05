"use client";

import {
  IWebSocketAdapter,
  WebSocketMessage,
} from "../../../domain/interfaces/adapters/websocket.interface";

export class WebSocketAdapter implements IWebSocketAdapter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private simulatedMode = true;

  constructor() {
    if (this.simulatedMode) {
      this.simulateConnection();
    } else {
      this.connect();
    }
  }

  private simulateConnection() {
    setTimeout(() => {
      console.log("模拟 WebSocket 连接已建立");
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
      "你好！最近怎么样？",
      "今天天气不错呢",
      "有空一起吃饭吗？",
      "工作顺利吗？",
      "周末有什么计划？",
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

  private connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket("wss://ws.postman-echo.com/raw");

      this.ws.onopen = () => {
        console.log("WebSocket 连接已建立");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit("connected", null);
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
                from: "echo_server",
                timestamp: Date.now(),
              };
            }
          } else {
            console.log("收到二进制数据:", event.data);
            return;
          }

          this.handleMessage(message);
        } catch (error) {
          console.warn("WebSocket 消息解析失败，使用原始数据:", event.data);

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
        console.log("WebSocket 连接已关闭", event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        this.emit("disconnected", null);

        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket 错误:", error);
        this.isConnecting = false;
        this.emit("error", error);
      };
    } catch (error) {
      console.error("WebSocket 连接失败:", error);
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
      console.log(
        `尝试重连 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        if (this.simulatedMode) {
          this.simulateConnection();
        } else {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("WebSocket 重连失败，已达到最大重试次数，切换到模拟模式");
      this.simulatedMode = true;
      this.simulateConnection();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log("收到消息:", message);
    this.emit(message.type, message);
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            ...message,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("发送消息失败:", error);
        this.messageQueue.push(message);
      }
    } else {
      console.warn("WebSocket 未连接，消息已加入队列");
      this.messageQueue.push(message);
    }
  }

  send(message: WebSocketMessage): void {
    if (this.simulatedMode) {
      console.log("模拟发送消息:", message);

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
      "收到！",
      "好的，我知道了",
      "没问题",
      "让我想想...",
      "这个想法不错",
      "我同意你的看法",
      "稍等，我查一下",
      "明白了",
      "谢谢你的消息",
      "我们稍后再聊",
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
    if (this.ws) {
      this.ws.close(1000, "用户主动断开");
      this.ws = null;
    }
  }

  isConnected(): boolean {
    if (this.simulatedMode) {
      return true;
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  setSimulatedMode(enabled: boolean): void {
    this.simulatedMode = enabled;
    if (enabled) {
      this.disconnect();
      this.simulateConnection();
    } else {
      this.connect();
    }
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
