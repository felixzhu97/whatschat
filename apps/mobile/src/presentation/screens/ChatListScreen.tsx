import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Chat, ChatType } from '@/src/domain/entities';
import { ChatListItem } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { chatService } from '@/src/application/services';

interface ChatListScreenProps {
  navigation: any;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const list = await chatService.getChats();
      setChats(list);
      setFilteredChats(list);
    } catch {
      setChats([]);
      setFilteredChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    filterChats();
  }, [searchQuery, selectedCategory, chats]);

  const filterChats = () => {
    let filtered = [...chats];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.name.toLowerCase().includes(query) ||
          chat.lastMessageContent?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory === 1) {
      filtered = filtered.filter((chat) => chat.unreadCount > 0);
    } else if (selectedCategory === 2) {
      // Favourites - would need a favourite field
    } else if (selectedCategory === 3) {
      filtered = filtered.filter((chat) => chat.type === ChatType.Group);
    }

    setFilteredChats(filtered);
  };

  const categories = ['全部', '未读', '收藏', '群组'];

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
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={categories}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(index)}
                style={[
                  styles.categoryButton,
                  selectedCategory === index && { backgroundColor: colors.primaryGreen },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        selectedCategory === index ? '#FFFFFF' : colors.secondaryText,
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
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
          data={filteredChats}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              onPress={() => navigation.navigate('ChatDetail', { chat: item })}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadChats();
              }}
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
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed" size={14} color={colors.secondaryText} />
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          Your personal messages are{' '}
          <Text style={{ color: colors.primaryGreen }}>end-to-end encrypted</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

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
  categoryContainer: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
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
  footer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

