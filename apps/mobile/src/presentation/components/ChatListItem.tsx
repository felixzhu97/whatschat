import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '@/src/domain/entities';
import { ChatAvatar } from './ChatAvatar';
import { styled } from '@/src/presentation/shared/emotion';

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

const Container = styled.TouchableOpacity`
  flex-direction: row;
  padding: 14px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const Content = styled.View`
  flex: 1;
  margin-left: 14px;
  justify-content: center;
  min-width: 0;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

const Name = styled.Text`
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  color: ${(p) => p.theme.colors.primaryText};
`;

const Time = styled.Text`
  font-size: 12px;
  color: ${(p) => p.theme.colors.secondaryText};
  margin-left: 8px;
`;

const BottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  min-width: 0;
`;

const LastMessage = styled.Text`
  font-size: 15px;
  flex: 1;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Badge = styled.View`
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  padding-horizontal: 6px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const BadgeText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

function formatTime(timestamp?: Date): string {
  if (!timestamp) return '';
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
  const unread = chat.unreadCount > 0;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <ChatAvatar name={chat.name} size={52} showBorder={chat.isPinned} />
      <Content>
        <TopRow>
          <Name numberOfLines={1}>{chat.name}</Name>
          <Time>
            {formatTime(
              chat.lastMessageTime instanceof Date
                ? chat.lastMessageTime
                : chat.lastMessageTime
                  ? new Date(chat.lastMessageTime)
                  : undefined
            )}
          </Time>
        </TopRow>
        <BottomRow>
          <LastMessage numberOfLines={1}>{chat.lastMessageContent || ' '}</LastMessage>
          {unread && (
            <Badge>
              <BadgeText>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</BadgeText>
            </Badge>
          )}
        </BottomRow>
      </Content>
    </Container>
  );
};
