"use client";

import { Button } from "@/src/presentation/components/ui/button";
import { Card } from "@/src/presentation/components/ui/card";
import { FileText, Image as ImageIcon, MessageCircle, Video } from "lucide-react";
import { styled } from "@/src/shared/utils/emotion";

interface AiActionMenuProps {
  onSmartReply?: () => void;
  onGenerateText?: () => void;
  onGenerateImage?: () => void;
  onGenerateVideo?: () => void;
}

const MenuCard = styled(Card)`
  padding: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  overflow: visible;
`;

const MenuGrid = styled.div<{ count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ count }) => (count === 4 ? 4 : 3)}, 1fr);
  gap: 0.5rem;
  min-width: ${({ count }) => (count === 4 ? "19rem" : "12rem")};
  width: max-content;
`;

const MenuOptionButton = styled(Button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  height: auto;
  padding: 0.75rem;
`;

const OptionLabel = styled.span`
  font-size: 0.75rem;
  white-space: nowrap;
`;

const TextIconStyled = styled(FileText)`
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(107 114 128);
`;

const ImageIconStyled = styled(ImageIcon)`
  height: 1.5rem;
  width: 1.5rem;
  color: #3b82f6;
`;

const VideoIconStyled = styled(Video)`
  height: 1.5rem;
  width: 1.5rem;
  color: rgb(147 51 234);
`;

const SmartReplyIconStyled = styled(MessageCircle)`
  height: 1.5rem;
  width: 1.5rem;
  color: #22c55e;
`;

export function AiActionMenu({
  onSmartReply,
  onGenerateText,
  onGenerateImage,
  onGenerateVideo,
}: AiActionMenuProps) {
  const count = [onSmartReply, onGenerateText, onGenerateImage, onGenerateVideo].filter(
    (x) => x != null
  ).length;
  if (count === 0) return null;

  return (
    <MenuCard>
      <MenuGrid count={count}>
        {onSmartReply != null && (
          <MenuOptionButton variant="ghost" size="sm" onClick={onSmartReply}>
            <SmartReplyIconStyled />
            <OptionLabel>智能回复</OptionLabel>
          </MenuOptionButton>
        )}
        {onGenerateText != null && (
          <MenuOptionButton variant="ghost" size="sm" onClick={onGenerateText}>
            <TextIconStyled />
            <OptionLabel>生成文本</OptionLabel>
          </MenuOptionButton>
        )}
        {onGenerateImage != null && (
          <MenuOptionButton variant="ghost" size="sm" onClick={onGenerateImage}>
            <ImageIconStyled />
            <OptionLabel>生成图片</OptionLabel>
          </MenuOptionButton>
        )}
        {onGenerateVideo != null && (
          <MenuOptionButton variant="ghost" size="sm" onClick={onGenerateVideo}>
            <VideoIconStyled />
            <OptionLabel>生成视频</OptionLabel>
          </MenuOptionButton>
        )}
      </MenuGrid>
    </MenuCard>
  );
}
