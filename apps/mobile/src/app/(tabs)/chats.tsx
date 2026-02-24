import React from 'react';
import {
  View,
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
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { chatService } from '@/src/application/services';

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const Header = styled.View`
  padding: 14px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => p.theme.colors.separator};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderSide = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-width: 72px;
`;

const HeaderSideRight = styled(HeaderSide)`
  justify-content: flex-end;
  gap: 8px;
`;

const Title = styled.Text`
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
  text-align: center;
`;

const HeaderButton = styled.TouchableOpacity`
  padding: 6px;
`;

const NewChatButton = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primaryGreen};
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <Header>
          <HeaderRow>
            <HeaderSide>
              <HeaderButton onPress={() => {}}>
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.primaryText} />
              </HeaderButton>
            </HeaderSide>
            <Title>聊天</Title>
            <HeaderSideRight>
              <HeaderButton onPress={() => {}}>
                <Ionicons name="camera-outline" size={22} color={colors.primaryText} />
              </HeaderButton>
              <HeaderButton onPress={() => {}}>
                <NewChatButton>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </NewChatButton>
              </HeaderButton>
            </HeaderSideRight>
          </HeaderRow>
        </Header>
        {loading ? (
          <EmptyContainerCentered>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
            <EmptyText>加载中...</EmptyText>
          </EmptyContainerCentered>
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
              <EmptyContainer>
                <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
                <EmptyText>暂无聊天</EmptyText>
              </EmptyContainer>
            }
          />
        )}
      </Page>
    </SafeAreaView>
  );
}
