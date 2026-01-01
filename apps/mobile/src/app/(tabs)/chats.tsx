import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chat, ChatType, ChatEntity } from '@/src/domain/entities';
import { ChatListItem } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';

export default function ChatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [chats, setChats] = React.useState<Chat[]>([]);

  React.useEffect(() => {
    const now = new Date();
    const mockChats: Chat[] = [
      new ChatEntity({
        id: '1',
        name: 'Jenny',
        type: ChatType.Individual,
        participantIds: ['user1', 'user2'],
        lastMessageContent: 'You reacted 👍 to "That\'s good advice, Marty."',
        lastMessageTime: new Date(now.getTime() - 114 * 60 * 1000),
        lastMessageSender: 'Jenny',
        unreadCount: 0,
        isPinned: true,
        createdAt: now,
        updatedAt: now,
      }),
      new ChatEntity({
        id: '2',
        name: 'Mom',
        type: ChatType.Individual,
        participantIds: ['user1', 'user3'],
        lastMessageContent: 'Mom is typing...',
        lastMessageTime: new Date(now.getTime() - 15 * 60 * 1000),
        lastMessageSender: 'Mom',
        unreadCount: 1,
        createdAt: now,
        updatedAt: now,
      }),
    ];
    setChats(mockChats);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.secondaryBackground }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primaryText }]}>聊天</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
              <Ionicons name="camera" size={24} color={colors.primaryText} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
              <View style={[styles.newChatButton, { backgroundColor: colors.primaryGreen }]}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            onPress={() => router.push(`/chat-detail?chatId=${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>暂无聊天</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 4,
  },
  newChatButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

