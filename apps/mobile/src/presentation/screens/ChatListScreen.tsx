import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Chat, ChatType } from '@/src/domain/entities';
import { ChatListItem } from '@/src/presentation/components';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { getChatUseCases } from '@/src/infrastructure/composition-root';

interface ChatListScreenProps {
  navigation: any;
}

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
`;

const Header = styled.View`
  padding: 8px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const HeaderTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const HeaderButton = styled.TouchableOpacity`
  padding: 4px;
`;

const NewChatButton = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const CategoryContainer = styled.View`
  margin-top: 8px;
`;

const CategoryButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 8px;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
  background-color: ${(p) =>
    p.selected ? p.theme.colors.primaryGreen : 'transparent'};
`;

const CategoryText = styled.Text<{ selected: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) =>
    p.selected ? '#ffffff' : p.theme.colors.secondaryText};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
`;

const EmptyContainerCentered = styled(EmptyContainer)`
  justify-content: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  margin-top: 16px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Footer = styled.View`
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${(p) => p.theme.colors.background};
`;

const FooterText = styled.Text`
  font-size: 13px;
  text-align: center;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const FooterLink = styled.Text`
  color: ${(p) => p.theme.colors.primaryGreen};
`;

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
      const list = await getChatUseCases().getChats();
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
    } else if (selectedCategory === 3) {
      filtered = filtered.filter((chat) => chat.type === ChatType.Group);
    }
    setFilteredChats(filtered);
  }, [searchQuery, selectedCategory, chats]);

  const categories = ['全部', '未读', '收藏', '群组'];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <Page>
      <Header>
        <HeaderTop>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <Title>聊天</Title>
          <HeaderRight>
            <HeaderButton onPress={() => {}}>
              <Ionicons name="camera" size={24} color={colors.primaryText} />
            </HeaderButton>
            <HeaderButton onPress={() => {}}>
              <NewChatButton>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </NewChatButton>
            </HeaderButton>
          </HeaderRight>
        </HeaderTop>
        <CategoryContainer>
          <FlatList
            horizontal
            data={categories}
            renderItem={({ item, index }) => (
              <CategoryButton
                onPress={() => setSelectedCategory(index)}
                selected={selectedCategory === index}
              >
                <CategoryText selected={selectedCategory === index}>
                  {item}
                </CategoryText>
              </CategoryButton>
            )}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </CategoryContainer>
      </Header>
      {loading ? (
        <EmptyContainerCentered>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <EmptyText>加载中...</EmptyText>
        </EmptyContainerCentered>
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
            <EmptyContainer>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
              <EmptyText>暂无聊天</EmptyText>
            </EmptyContainer>
          }
        />
      )}
      <Footer>
        <Ionicons name="lock-closed" size={14} color={colors.secondaryText} />
        <FooterText>
          Your personal messages are <FooterLink>end-to-end encrypted</FooterLink>
        </FooterText>
      </Footer>
    </Page>
    </SafeAreaView>
  );
};
