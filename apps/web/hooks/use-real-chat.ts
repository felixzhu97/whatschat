"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getWebSocketManager } from "../lib/websocket";
import type { Message as AppMessage } from "../types";

export interface ChatState {
  messages: AppMessage[];
  isTyping: boolean;
  typingUsers: string[];
  isConnected: boolean;
}

export function useRealChat(contactId: string) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    typingUsers: [],
    isConnected: false,
  });

  const wsManager = getWebSocketManager();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentContactId = useRef(contactId);

  // 更新当前联系人ID
  useEffect(() => {
    currentContactId.current = contactId;
    loadChatHistory(contactId);
  }, [contactId]);

  // 设置 WebSocket 事件监听
  useEffect(() => {
    const handleMessage = (wsMessage: any) => {
      // 检查消息是否与当前联系人相关
      const isRelevant =
        wsMessage.from === currentContactId.current ||
        wsMessage.to === currentContactId.current ||
        wsMessage.from === "simulated_user" || // 处理模拟消息
        wsMessage.from === "echo_server" ||
        wsMessage.from === "server";

      if (isRelevant) {
        const message: AppMessage = {
          id: wsMessage.data.id || Date.now().toString(),
          senderId: wsMessage.from || "peer",
          senderName: "对方",
          content: wsMessage.data.text || "",
          timestamp: new Date(wsMessage.timestamp || Date.now()).toISOString(),
          type: (wsMessage.data.type as AppMessage["type"]) || "text",
          status: "delivered",
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));

        // 发送已读回执（仅对真实用户消息）
        if (
          !message.sent &&
          wsMessage.from !== "simulated_user" &&
          wsMessage.from !== "echo_server" &&
          wsMessage.from !== "server"
        ) {
          wsManager.send({
            type: "message_read",
            to: wsMessage.from,
            data: { messageId: message.id },
          });
        }
      }
    };

    const handleMessageStatus = (statusMessage: any) => {
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === statusMessage.messageId
            ? {
                ...msg,
                delivered:
                  statusMessage.status === "delivered" ||
                  statusMessage.status === "read",
                read: statusMessage.status === "read",
              }
            : msg
        ),
      }));
    };

    const handleTyping = (wsMessage: any) => {
      if (wsMessage.from === currentContactId.current) {
        setChatState((prev) => ({
          ...prev,
          isTyping: wsMessage.data.isTyping,
        }));

        if (wsMessage.data.isTyping) {
          // 3秒后自动清除输入状态
          setTimeout(() => {
            setChatState((prev) => ({
              ...prev,
              isTyping: false,
            }));
          }, 3000);
        }
      }
    };

    const handleConnected = () => {
      setChatState((prev) => ({ ...prev, isConnected: true }));
    };

    const handleDisconnected = () => {
      setChatState((prev) => ({ ...prev, isConnected: false }));
    };

    wsManager.on("message", handleMessage);
    wsManager.on("message_status", handleMessageStatus);
    wsManager.on("typing", handleTyping);
    wsManager.on("connected", handleConnected);
    wsManager.on("disconnected", handleDisconnected);

    // 设置初始连接状态
    setChatState((prev) => ({ ...prev, isConnected: wsManager.isConnected() }));

    return () => {
      wsManager.off("message", handleMessage);
      wsManager.off("message_status", handleMessageStatus);
      wsManager.off("typing", handleTyping);
      wsManager.off("connected", handleConnected);
      wsManager.off("disconnected", handleDisconnected);
    };
  }, [wsManager]);

  const loadChatHistory = useCallback((contactId: string) => {
    // 从本地存储加载聊天历史
    const savedMessages = localStorage.getItem(`chat_${contactId}`);
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        setChatState((prev) => ({ ...prev, messages }));
      } catch (error) {
        console.error("加载聊天历史失败:", error);
        setChatState((prev) => ({ ...prev, messages: [] }));
      }
    } else {
      // 设置一些初始消息
      const initialMessages: AppMessage[] = [
        {
          id: "welcome_1",
          senderId: currentContactId.current,
          senderName: "系统",
          content: "欢迎使用 WhatsApp Web！",
          timestamp: new Date().toISOString(),
          type: "text",
          status: "read",
        },
        {
          id: "welcome_2",
          senderId: currentContactId.current,
          senderName: "系统",
          content: "这是一个功能完整的聊天应用演示",
          timestamp: new Date().toISOString(),
          type: "text",
          status: "read",
        },
      ];
      setChatState((prev) => ({ ...prev, messages: initialMessages }));
    }
  }, []);

  const sendMessage = useCallback(
    (
      text: string,
      type: AppMessage["type"] = "text",
      fileData?: Partial<AppMessage>,
      duration?: number
    ) => {
      const newMessage: AppMessage = {
        id: Date.now().toString(),
        senderId: "current-user",
        senderName: "我",
        content: text,
        timestamp: new Date().toISOString(),
        type,
        status: "sending",
        ...(fileData as any),
      };

      // 添加到本地状态
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // 发送到服务器
      wsManager.send({
        type: "message",
        to: currentContactId.current,
        data: {
          id: newMessage.id,
          text,
          type,
          ...(fileData as any),
          duration,
        },
      });

      // 保存到本地存储
      setTimeout(() => {
        const updatedMessages = [...chatState.messages, newMessage];
        localStorage.setItem(
          `chat_${currentContactId.current}`,
          JSON.stringify(updatedMessages)
        );
      }, 100);
    },
    [wsManager, chatState.messages]
  );

  const startTyping = useCallback(() => {
    wsManager.send({
      type: "typing",
      to: currentContactId.current,
      data: { isTyping: true },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      wsManager.send({
        type: "typing",
        to: currentContactId.current,
        data: { isTyping: false },
      });
    }, 3000);
  }, [wsManager]);

  const stopTyping = useCallback(() => {
    wsManager.send({
      type: "typing",
      to: currentContactId.current,
      data: { isTyping: false },
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [wsManager]);

  const deleteMessage = useCallback(
    (messageId: string) => {
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== messageId),
      }));

      // 更新本地存储
      setTimeout(() => {
        const updatedMessages = chatState.messages.filter(
          (msg) => msg.id !== messageId
        );
        localStorage.setItem(
          `chat_${currentContactId.current}`,
          JSON.stringify(updatedMessages)
        );
      }, 100);
    },
    [chatState.messages]
  );

  const editMessage = useCallback(
    (messageId: string, newText: string) => {
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
        ),
      }));

      // 更新本地存储
      setTimeout(() => {
        const updatedMessages = chatState.messages.map((msg) =>
          msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
        );
        localStorage.setItem(
          `chat_${currentContactId.current}`,
          JSON.stringify(updatedMessages)
        );
      }, 100);
    },
    [chatState.messages]
  );

  return {
    ...chatState,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessage,
    editMessage,
  };
}
