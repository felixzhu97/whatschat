"use client";

import { Phone, Video, MoreVertical, Users, BellOff } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/presentation/components/ui/avatar";
import { Button } from "@/src/presentation/components/ui/button";
import type { Contact } from "../../../types";
import { styled } from "@/src/shared/utils/emotion";

interface ChatHeaderProps {
  contact: Contact;
  isTyping: boolean;
  isGroup: boolean;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onShowInfo: () => void;
}

const HeaderRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
  background-color: hsl(var(--card));
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
  font-weight: 500;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const OnlineDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #22c55e;
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
`;

const TypingText = styled.span`
  color: #16a34a;
`;

export function ChatHeader({
  contact,
  isTyping,
  isGroup,
  onVoiceCall,
  onVideoCall,
  onShowInfo,
}: ChatHeaderProps) {
  return (
    <HeaderRoot>
      <LeftSection>
        <Avatar>
          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
          <AvatarFallback>{contact.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <TitleRow>
            {contact.name}
            {contact.isGroup && <Users size={16} color="#6b7280" />}
            {contact.muted && <BellOff size={16} color="#9ca3af" />}
          </TitleRow>
          <MetaRow>
            {contact.isGroup ? (
              <span>{contact.members?.length || 3} 位成员</span>
            ) : contact.isOnline ? (
              <>
                <OnlineDot />
                <span>在线</span>
              </>
            ) : (
              <span>离线</span>
            )}
            {isTyping && <TypingText>正在输入...</TypingText>}
          </MetaRow>
        </div>
      </LeftSection>
      <RightActions>
        <Button variant="ghost" size="icon" onClick={onVoiceCall}>
          <Phone size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onVideoCall}>
          <Video size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onShowInfo}>
          <MoreVertical size={16} />
        </Button>
      </RightActions>
    </HeaderRoot>
  );
}
