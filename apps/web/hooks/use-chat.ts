"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
  delivered?: boolean;
  read?: boolean;
  sender?: string;
  senderName?: string;
  type: "text" | "image" | "file" | "audio" | "voice";
  replyTo?: string;
  edited?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: number;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  typingUsers: string[];
}

export function useChat(contactId: string) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    typingUsers: [],
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 模拟加载聊天记录
  useEffect(() => {
    loadChatHistory(contactId);
  }, [contactId]);

  const loadChatHistory = useCallback((contactId: string) => {
    // 模拟不同联系人的聊天记录
    const mockMessages: Record<string, Message[]> = {
      "1": [
        {
          id: "1",
          text: "你好！",
          time: "14:25",
          sent: false,
          type: "text",
        },
        {
          id: "2",
          text: "你好，有什么事吗？",
          time: "14:26",
          sent: true,
          delivered: true,
          read: true,
          type: "text",
        },
        {
          id: "3",
          text: "今天有空吗？想约你一起吃饭",
          time: "14:28",
          sent: false,
          type: "text",
        },
        {
          id: "4",
          text: "当然可以！几点？在哪里？",
          time: "14:30",
          sent: true,
          delivered: true,
          read: true,
          type: "text",
        },
      ],
      group1: [
        {
          id: "1",
          text: "大家好，今天的会议有什么要讨论的吗？",
          time: "14:25",
          sent: false,
          sender: "user2",
          senderName: "李四",
          type: "text",
        },
        {
          id: "2",
          text: "我觉得我们需要重新评估项目时间线",
          time: "14:26",
          sent: true,
          delivered: true,
          read: true,
          type: "text",
        },
        {
          id: "3",
          text: "同意，现在的进度确实有点紧张",
          time: "14:28",
          sent: false,
          sender: "user3",
          senderName: "王五",
          type: "text",
        },
      ],
    };

    setChatState((prev) => ({
      ...prev,
      messages: mockMessages[contactId] || [],
    }));
  }, []);

  const sendMessage = useCallback(
    (
      text: string,
      type: "text" | "image" | "file" | "voice" = "text",
      fileData?: any,
      duration?: number
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sent: true,
        delivered: false,
        read: false,
        type,
        ...fileData,
        duration,
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // 模拟消息状态更新
      setTimeout(() => {
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, delivered: true } : msg
          ),
        }));
      }, 1000);

      setTimeout(() => {
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, read: true } : msg
          ),
        }));
      }, 3000);

      // 模拟对方回复
      if (Math.random() > 0.5) {
        setTimeout(
          () => {
            simulateIncomingMessage(contactId);
          },
          2000 + Math.random() * 3000
        );
      }
    },
    [contactId]
  );

  const simulateIncomingMessage = useCallback((contactId: string) => {
    const responses = [
      "好的，我知道了",
      "没问题！",
      "让我想想...",
      "这个想法不错",
      "我同意你的看法",
      "稍等，我查一下",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const incomingMessage: Message = {
      id: Date.now().toString(),
      text: randomResponse,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sent: false,
      type: "text",
      sender: contactId.startsWith("group")
        ? "user" + Math.floor(Math.random() * 3 + 1)
        : undefined,
      senderName: contactId.startsWith("group")
        ? ["张三", "李四", "王五"][Math.floor(Math.random() * 3)]
        : undefined,
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, incomingMessage],
    }));
  }, []);

  const startTyping = useCallback(() => {
    setChatState((prev) => ({ ...prev, isTyping: true }));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setChatState((prev) => ({ ...prev, isTyping: false }));
    }, 3000);
  }, []);

  const stopTyping = useCallback(() => {
    setChatState((prev) => ({ ...prev, isTyping: false }));
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== messageId),
    }));
  }, []);

  const editMessage = useCallback((messageId: string, newText: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
      ),
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessage,
    editMessage,
  };
}
