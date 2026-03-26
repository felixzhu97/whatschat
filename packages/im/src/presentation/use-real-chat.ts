"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "@whatschat/shared-types";
import type { IWebSocketAdapter, ChatState } from "../domain";

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface UseRealChatOptions {
  getWebSocketAdapter: () => IWebSocketAdapter;
  storage?: StorageAdapter;
}

export function useRealChat(contactId: string, options: UseRealChatOptions) {
  const { getWebSocketAdapter, storage } = options;
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    typingUsers: [],
    isConnected: false,
  });

  const wsManager = getWebSocketAdapter();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentContactId = useRef(contactId);

  useEffect(() => {
    currentContactId.current = contactId;
    loadChatHistory(contactId);
  }, [contactId]);

  useEffect(() => {
    const handleMessage = (wsMessage: unknown) => {
      const msg = wsMessage as {
        from?: string;
        to?: string;
        data?: { id?: string; text?: string; type?: string };
        timestamp?: number;
      };
      const isRelevant =
        msg.from === currentContactId.current ||
        msg.to === currentContactId.current ||
        msg.from === "simulated_user" ||
        msg.from === "echo_server" ||
        msg.from === "server";

      if (isRelevant) {
        const message: Message = {
          id: msg.data?.id || Date.now().toString(),
          senderId: msg.from || "peer",
          senderName: "对方",
          content: msg.data?.text || "",
          timestamp: new Date(msg.timestamp || Date.now()).toISOString(),
          type: (msg.data?.type as Message["type"]) || "text",
          status: "delivered",
        };

        setChatState((prev: ChatState) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));

        if (
          message.senderId !== "current-user" &&
          msg.from !== "simulated_user" &&
          msg.from !== "echo_server" &&
          msg.from !== "server"
        ) {
          wsManager.send({
            type: "message_read",
            to: msg.from!,
            data: { messageId: message.id },
          });
        }
      }
    };

    const handleMessageStatus = (payload: unknown) => {
      const statusMessage = payload as { messageId: string; status: string };
      setChatState((prev: ChatState) => ({
        ...prev,
        messages: prev.messages.map((msg: Message) =>
          msg.id === statusMessage.messageId
            ? { ...msg, status: statusMessage.status as Message["status"] }
            : msg
        ),
      }));
    };

    const handleTyping = (payload: unknown) => {
      const wsMessage = payload as { from?: string; data?: { isTyping: boolean } };
      if (wsMessage.from === currentContactId.current) {
        setChatState((prev: ChatState) => ({
          ...prev,
          isTyping: wsMessage.data?.isTyping ?? false,
        }));
        if (wsMessage.data?.isTyping) {
          setTimeout(() => {
            setChatState((prev: ChatState) => ({ ...prev, isTyping: false }));
          }, 3000);
        }
      }
    };

    const handleConnected = () => {
      setChatState((prev: ChatState) => ({ ...prev, isConnected: true }));
    };

    const handleDisconnected = () => {
      setChatState((prev: ChatState) => ({ ...prev, isConnected: false }));
    };

    wsManager.on("message", handleMessage);
    wsManager.on("message_status", handleMessageStatus);
    wsManager.on("typing", handleTyping);
    wsManager.on("connected", handleConnected);
    wsManager.on("disconnected", handleDisconnected);
    setChatState((prev: ChatState) => ({ ...prev, isConnected: wsManager.isConnected() }));

    return () => {
      wsManager.off("message", handleMessage);
      wsManager.off("message_status", handleMessageStatus);
      wsManager.off("typing", handleTyping);
      wsManager.off("connected", handleConnected);
      wsManager.off("disconnected", handleDisconnected);
    };
  }, [wsManager]);

  const loadChatHistory = useCallback((cid: string) => {
    if (storage) {
      const savedMessages = storage.getItem(`chat_${cid}`);
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages) as Message[];
          setChatState((prev: ChatState) => ({ ...prev, messages }));
          return;
        } catch {
          setChatState((prev: ChatState) => ({ ...prev, messages: [] }));
          return;
        }
      }
    }
    const initialMessages: Message[] = [
      {
        id: "welcome_1",
        senderId: cid,
        senderName: "系统",
        content: "欢迎使用 Instagram！",
        timestamp: new Date().toISOString(),
        type: "text",
        status: "read",
      },
      {
        id: "welcome_2",
        senderId: cid,
        senderName: "系统",
        content: "这是一个功能完整的聊天应用演示",
        timestamp: new Date().toISOString(),
        type: "text",
        status: "read",
      },
    ];
    setChatState((prev: ChatState) => ({ ...prev, messages: initialMessages }));
  }, [storage]);

  const sendMessage = useCallback(
    (
      text: string,
      type: Message["type"] = "text",
      fileData?: Partial<Message>,
      duration?: number
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: "current-user",
        senderName: "我",
        content: text,
        timestamp: new Date().toISOString(),
        type,
        status: "sending",
        ...(fileData ?? {}),
      };

      setChatState((prev: ChatState) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      wsManager.send({
        type: "message",
        to: currentContactId.current,
        data: { id: newMessage.id, text, type, ...(fileData ?? {}), duration },
      });

      if (storage) {
        const chatId = currentContactId.current;
        setTimeout(() => {
          setChatState((prev: ChatState) => {
            const updated = [...prev.messages, newMessage];
            storage.setItem(`chat_${chatId}`, JSON.stringify(updated));
            return prev;
          });
        }, 100);
      }
    },
    [wsManager, storage]
  );

  const startTyping = useCallback(() => {
    wsManager.send({
      type: "typing",
      to: currentContactId.current,
      data: { isTyping: true },
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [wsManager]);

  const deleteMessage = useCallback((messageId: string) => {
    const chatId = currentContactId.current;
    setChatState((prev: ChatState) => {
      const updated = prev.messages.filter((msg: Message) => msg.id !== messageId);
      if (storage) storage.setItem(`chat_${chatId}`, JSON.stringify(updated));
      return { ...prev, messages: updated };
    });
  }, [storage]);

  const editMessage = useCallback((messageId: string, newText: string) => {
    const chatId = currentContactId.current;
    setChatState((prev: ChatState) => {
      const updated = prev.messages.map((msg: Message) =>
        msg.id === messageId ? { ...msg, content: newText, isEdited: true } : msg
      );
      if (storage) storage.setItem(`chat_${chatId}`, JSON.stringify(updated));
      return { ...prev, messages: updated };
    });
  }, [storage]);

  return {
    ...chatState,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessage,
    editMessage,
  };
}
