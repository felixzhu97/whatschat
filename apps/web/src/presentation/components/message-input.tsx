"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useAbTest } from "@/presentation/hooks/use-ab-test";
import { Button } from "@/src/presentation/components/ui/button";
import { Textarea } from "@/src/presentation/components/ui/textarea";
import { Smile, Paperclip, Send, X, Sparkles } from "lucide-react";
import { AiActionMenu } from "./ai-action-menu";
import { EmojiPicker } from "./emoji-picker";
import { FileUpload } from "./file-upload";
import { VoiceRecorder } from "./voice-recorder";
import type { Message } from "../../../types";
import { styled } from "@/src/shared/utils/emotion";

interface MessageInputProps {
  messageText: string;
  showEmojiPicker: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  isRecordingVoice: boolean;
  onMessageChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onEmojiSelect: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (file: File) => void;
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onRecordingChange: (isRecording: boolean) => void;
  onSmartReplyClick?: () => void;
  onGenerateVideoClick?: () => void;
  onGenerateTextClick?: () => void;
  onGenerateImageClick?: () => void;
}

const InputShell = styled.div`
  border-top: 1px solid hsl(var(--border));
  background-color: hsl(var(--card));
  padding: 1rem;
`;

const DisabledBanner = styled.div`
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background-color: rgb(249 250 251);
  padding: 1.5rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
  text-align: center;
`;

const ReplyBox = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border-left: 4px solid #22c55e;
  background-color: rgb(249 250 251);
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReplyTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(55 65 81);
`;

const ReplyExcerpt = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: flex-end;
  column-gap: 0.5rem;
`;

const IconButtonWrapper = styled.div`
  position: relative;
`;

const PopoverContainer = styled.div`
  position: absolute;
  left: 0;
  bottom: 3rem;
  z-index: 50;
  overflow: visible;
`;

const MessageTextarea = styled(Textarea)`
  min-height: 2.5rem;
  max-height: 8rem;
  resize: none;
`;

const PrimarySendButton = styled(Button)`
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

const TextareaWrapper = styled.div`
  flex: 1;
`;

export function MessageInput({
  messageText,
  showEmojiPicker,
  replyingTo,
  editingMessage,
  isRecordingVoice,
  onMessageChange,
  onKeyDown,
  onSendMessage,
  onEmojiSelect,
  onToggleEmojiPicker,
  onFileSelect,
  onSendVoice,
  onCancelReply,
  onCancelEdit,
  onRecordingChange,
  onSmartReplyClick,
  onGenerateVideoClick,
  onGenerateTextClick,
  onGenerateImageClick,
}: MessageInputProps) {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAiActions =
    onGenerateTextClick != null ||
    onGenerateImageClick != null ||
    onGenerateVideoClick != null;
  const sendMessageEnabled = useFeatureIsOn("send_message");
  const inputPlaceholderVariant = useAbTest("message-input-placeholder");
  const placeholder =
    inputPlaceholderVariant === "variant" ? "Type a message..." : "输入消息...";

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    onKeyDown(e);
  };

  const handleFileUpload = (file: File, type: "image" | "file") => {
    onFileSelect(file);
    setShowFileUpload(false);
  };

  if (!sendMessageEnabled) {
    return (
      <InputShell>
        <DisabledBanner>Send message is currently disabled</DisabledBanner>
      </InputShell>
    );
  }

  return (
    <InputShell>
      {(replyingTo || editingMessage) && (
        <ReplyBox>
          <ReplyHeader>
            <div>
              <ReplyTitle>
                {editingMessage ? "编辑消息" : `回复 ${replyingTo?.senderName}`}
              </ReplyTitle>
              <ReplyExcerpt>
                {editingMessage ? editingMessage.content : replyingTo?.content}
              </ReplyExcerpt>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={editingMessage ? onCancelEdit : onCancelReply}
            >
              <X size={16} />
            </Button>
          </ReplyHeader>
        </ReplyBox>
      )}

      <ToolbarRow>
        <IconButtonWrapper>
          <Button variant="ghost" size="sm" onClick={onToggleEmojiPicker}>
            <Smile size={20} />
          </Button>
          {showEmojiPicker && (
            <PopoverContainer>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={onToggleEmojiPicker}
                onEmojiSelect={onEmojiSelect}
              />
            </PopoverContainer>
          )}
        </IconButtonWrapper>

        <IconButtonWrapper>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowFileUpload(!showFileUpload);
              setShowAiMenu(false);
            }}
          >
            <Paperclip size={20} />
          </Button>
          {showFileUpload && (
            <PopoverContainer>
              <FileUpload onFileSelect={handleFileUpload} />
            </PopoverContainer>
          )}
        </IconButtonWrapper>

        {(hasAiActions || onSmartReplyClick != null) && (
          <IconButtonWrapper>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAiMenu(!showAiMenu);
                setShowFileUpload(false);
              }}
            >
              <Sparkles size={20} />
            </Button>
            {showAiMenu && (
              <PopoverContainer>
                <AiActionMenu
                  onSmartReply={
                    onSmartReplyClick
                      ? () => {
                          setShowAiMenu(false);
                          onSmartReplyClick();
                        }
                      : undefined
                  }
                  onGenerateText={
                    onGenerateTextClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateTextClick();
                        }
                      : undefined
                  }
                  onGenerateImage={
                    onGenerateImageClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateImageClick();
                        }
                      : undefined
                  }
                  onGenerateVideo={
                    onGenerateVideoClick
                      ? () => {
                          setShowAiMenu(false);
                          onGenerateVideoClick();
                        }
                      : undefined
                  }
                />
              </PopoverContainer>
            )}
          </IconButtonWrapper>
        )}

        <TextareaWrapper>
          <MessageTextarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
          />
        </TextareaWrapper>

        {messageText.trim() ? (
          <PrimarySendButton onClick={handleSend} size="sm">
            <Send size={16} />
          </PrimarySendButton>
        ) : (
          <VoiceRecorder onSendVoice={onSendVoice} onRecordingChange={onRecordingChange} />
        )}
      </ToolbarRow>
    </InputShell>
  );
}
