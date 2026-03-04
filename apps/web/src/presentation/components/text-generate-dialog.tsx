"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/presentation/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/presentation/components/ui/dialog";
import { Label } from "@/src/presentation/components/ui/label";
import { AiApiAdapter } from "@/infrastructure/adapters/api/ai-api.adapter";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";
import { styled } from "@/src/shared/utils/emotion";

const ErrorText = styled.p`
  font-size: 0.875rem;
  color: rgb(185 28 28);
  margin-top: 0.5rem;
`;

const StatusText = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
  margin-top: 0.5rem;
`;

const OutputBox = styled.pre`
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 12rem;
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  background: rgb(249 250 251);
`;

const PrimaryButton = styled(Button)`
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

interface TextGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (content: string) => void;
}

export function TextGenerateDialog({
  isOpen,
  onClose,
  onSuccess,
}: TextGenerateDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aiApiRef = useRef(new AiApiAdapter(getApiClient()));

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) return;
    setError("");
    setStatus("生成中...");
    setOutput("");
    setIsSubmitting(true);
    try {
      await aiApiRef.current.postChatStream(
        [{ role: "user", content: prompt.trim() }],
        (chunk) => setOutput((prev) => prev + chunk)
      );
      setStatus("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (output) {
      void navigator.clipboard.writeText(output);
    }
  };

  const handleSendToChat = () => {
    if (output) {
      onSuccess(output);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    setOutput("");
    setError("");
    void handleSubmit();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrompt("");
      setOutput("");
      setError("");
      setStatus("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文本生成</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="text-prompt">描述</Label>
          <textarea
            id="text-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入提示词"
            disabled={isSubmitting}
            rows={3}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid rgb(229 231 235)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          />
          {output ? (
            <OutputBox role="log" aria-live="polite">
              {output}
            </OutputBox>
          ) : null}
          {error ? <ErrorText>{error}</ErrorText> : null}
          {status ? <StatusText>{status}</StatusText> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            取消
          </Button>
          {output && !isSubmitting ? (
            <>
              <Button variant="outline" onClick={handleRegenerate} disabled={!prompt.trim()}>
                重新生成
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                复制
              </Button>
              <PrimaryButton onClick={handleSendToChat}>发送到聊天</PrimaryButton>
            </>
          ) : (
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!prompt.trim() || isSubmitting}
            >
              生成
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
