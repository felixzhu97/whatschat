import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '@/src/domain/entities';
import { ChatAvatar } from './ChatAvatar';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

const Container = styled.TouchableOpacity`
  flex-direction: row;
  padding: 12px 16px;
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => p.theme.colors.separator};
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
  flex: 1;
  color: ${(p) => p.theme.colors.primaryText};
  font-weight: ${(p: { unread: boolean }) => (p.unread ? '600' : '400')};
`;

const Time = styled.Text`
  font-size: 12px;
  color: ${(p: { unread: boolean }) =>
    p.unread ? p.theme.colors.primaryGreen : p.theme.colors.secondaryText};
  margin-left: 8px;
`;

const BottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
`;

const LastMessage = styled.Text`
  font-size: 15px;
  flex: 1;
  color: ${(p: { unread: boolean }) =>
    p.unread ? p.theme.colors.primaryText : p.theme.colors.secondaryText};
`;

const Badge = styled.View`
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  padding: 0 6px;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
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
  const { colors } = useTheme();
  const unread = chat.unreadCount > 0;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <ChatAvatar name={chat.name} size={52} showBorder={chat.isPinned} />
      <Content>
        <TopRow>
          <Name unread={unread} numberOfLines={1}>
            {chat.name}
          </Name>
          <Time unread={unread}>{formatTime(chat.lastMessageTime)}</Time>
          {chat.isPinned && (
            <Ionicons name="pin" size={14} color={colors.secondaryText} style={{ marginLeft: 4 }} />
          )}
        </TopRow>
        <BottomRow>
          <LastMessage unread={unread} numberOfLines={1}>
            {chat.lastMessageContent || ''}
          </LastMessage>
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
