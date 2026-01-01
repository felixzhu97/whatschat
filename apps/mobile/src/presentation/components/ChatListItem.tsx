import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '@/src/domain/entities';
import { ChatAvatar } from './ChatAvatar';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onPress }) => {
  const { colors } = useTheme();

  const formatTime = (timestamp?: Date): string => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hour = timestamp.getHours();
      const minute = timestamp.getMinutes();
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return `${timestamp.getMonth() + 1}/${timestamp.getDate()}`;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ChatAvatar name={chat.name} size={50} showBorder={chat.isPinned} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.name,
              {
                color: colors.primaryText,
                fontWeight: chat.unreadCount > 0 ? '600' : '500',
              },
            ]}
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <View style={styles.timeContainer}>
            <Text
              style={[
                styles.time,
                {
                  color: chat.unreadCount > 0 ? colors.primaryGreen : colors.secondaryText,
                },
              ]}
            >
              {formatTime(chat.lastMessageTime)}
            </Text>
            {chat.isPinned && (
              <Ionicons name="pin" size={14} color={colors.secondaryText} style={styles.pinIcon} />
            )}
          </View>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              {
                color: chat.unreadCount > 0 ? colors.primaryText : colors.secondaryText,
              },
            ]}
            numberOfLines={1}
          >
            {chat.lastMessageContent || ''}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primaryGreen }]}>
              <Text style={styles.badgeText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount.toString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 13,
  },
  pinIcon: {
    marginLeft: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

