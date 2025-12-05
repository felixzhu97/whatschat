import { useState, useCallback } from "react";
import type { Message, Contact } from "@/shared/types";
import { mockMessages } from "@/infrastructure/data/mock-data";
import {
  createMessage,
  addMessageToContact,
  simulateGroupResponse,
  simulateIndividualResponse,
} from "@/shared/utils/message-utils";

interface UseMessagesProps {
  selectedContactId: string | null;
  selectedContact: Contact | null;
}

export function useMessages({
  selectedContactId,
  selectedContact,
}: UseMessagesProps) {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleMessageChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (text.trim() && !isTyping) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    },
    [isTyping]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (messageText.trim()) {
          handleSendMessage(messageText.trim());
        }
      }
    },
    [messageText]
  );

  const handleSendMessage = useCallback(
    (
      content: string,
      type: "text" | "image" | "video" | "audio" | "file" = "text"
    ) => {
      if (!content.trim() && type === "text") return;
      if (!selectedContactId) return;

      console.log("Sending message:", content, type);

      // Create new message
      const newMessage = createMessage(content, type);

      // Add to messages
      addMessageToContact(selectedContactId, newMessage, mockMessages);

      // Clear input
      setMessageText("");
      setReplyingTo(null);
      setEditingMessage(null);
      setIsTyping(false);

      // Simulate response
      simulateResponse(selectedContactId, selectedContact);
    },
    [selectedContactId, selectedContact]
  );

  const simulateResponse = useCallback(
    (contactId: string, contact: Contact | null) => {
      const isGroupChat = contact?.isGroup;

      setTimeout(
        () => {
          if (isGroupChat) {
            simulateGroupResponse(contactId, mockMessages);
          } else {
            simulateIndividualResponse(
              contactId,
              contact?.name || "联系人",
              mockMessages
            );
          }
        },
        1000 + Math.random() * 2000
      );
    },
    []
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessageText((prev) => prev + emoji);
  }, []);

  const handleToggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      console.log("File selected:", file.name);
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
            ? "audio"
            : "file";

      handleSendMessage(file.name, fileType);
    },
    [handleSendMessage]
  );

  const handleSendVoice = useCallback(
    (audioBlob: Blob, duration: number) => {
      console.log("Voice message sent:", duration);
      handleSendMessage(`语音消息 ${Math.round(duration)}秒`, "audio");
    },
    [handleSendMessage]
  );

  const handleReply = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const handleEdit = useCallback((message: Message) => {
    setEditingMessage(message);
    setMessageText(message.content);
  }, []);

  const handleDelete = useCallback((message: Message) => {
    console.log("Delete message:", message.id);
  }, []);

  const handleForward = useCallback((message: Message) => {
    console.log("Forward message:", message.id);
  }, []);

  const handleStar = useCallback((message: Message) => {
    console.log("Star message:", message.id);
  }, []);

  const handleInfo = useCallback((message: Message) => {
    console.log("Message info:", message.id);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageText("");
  }, []);

  const handleRecordingChange = useCallback((isRecording: boolean) => {
    setIsRecordingVoice(isRecording);
  }, []);

  return {
    messageText,
    showEmojiPicker,
    replyingTo,
    editingMessage,
    isRecordingVoice,
    isTyping,
    handleMessageChange,
    handleKeyPress,
    handleSendMessage,
    handleEmojiSelect,
    handleToggleEmojiPicker,
    handleFileSelect,
    handleSendVoice,
    handleReply,
    handleEdit,
    handleDelete,
    handleForward,
    handleStar,
    handleInfo,
    handleCancelReply,
    handleCancelEdit,
    handleRecordingChange,
  };
}
