import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '@/src/domain/entities';
import { ChatListItem } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { chatService } from '@/src/application/services';

export default function ChatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadChats = React.useCallback(async () => {
    try {
      const list = await chatService.getChats();
      setChats(list);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadChats();
    }, [loadChats])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadChats();
  }, [loadChats]);

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
      {loading ? (
        <View style={[styles.emptyContainer, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={[styles.emptyText, { color: colors.secondaryText, marginTop: 16 }]}>
            加载中...
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              onPress={() => router.push(`/chat-detail?chatId=${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryGreen}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>暂无聊天</Text>
            </View>
          }
        />
      )}
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

