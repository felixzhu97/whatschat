import React from 'react';
import { FlatList, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '@/src/domain/entities';
import { ChatListItem, GlassView } from '@/src/presentation/components';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useTranslation } from '@/src/presentation/shared/i18n';
import { chatService } from '@/src/application/services';

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const HeaderBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 14px;
  padding-horizontal: 16px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-weight: 600;
  color: #25D366;
`;

const HeaderIcons = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const HeaderButton = styled.TouchableOpacity`
  padding: 6px;
`;

const SearchRow = styled.View`
  padding-horizontal: 16px;
  padding-bottom: 12px;
`;

const SearchBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #E9E9EB;
  border-radius: 24px;
  padding-vertical: 10px;
  padding-horizontal: 14px;
  gap: 10px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 0;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText ?? '#000'};
`;

const HEADER_HEIGHT = 104;

const HeaderGlassWrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
`;

const LoadingWrap = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${HEADER_HEIGHT}px;
`;

const EmptyWrap = styled(EmptyContainer)`
  padding-top: ${HEADER_HEIGHT + 40}px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  margin-top: 16px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

export default function ChatsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Page>
        <HeaderGlassWrap>
          <GlassView
            liquid
            style={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <HeaderBar>
              <HeaderTitle>{t('chats.title')}</HeaderTitle>
              <HeaderIcons>
                <HeaderButton onPress={() => {}}>
                  <Ionicons name="camera-outline" size={24} color={colors.primaryText} />
                </HeaderButton>
                <HeaderButton onPress={() => {}}>
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.primaryText} />
                </HeaderButton>
              </HeaderIcons>
            </HeaderBar>
            <SearchRow>
              <SearchBox>
                <Ionicons name="sparkles" size={20} color="#8E8E93" />
                <SearchInput
                  placeholder={t('chats.searchPlaceholder')}
                  placeholderTextColor="#8E8E93"
                  returnKeyType="search"
                />
              </SearchBox>
            </SearchRow>
          </GlassView>
        </HeaderGlassWrap>
        {loading ? (
          <LoadingWrap>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
            <EmptyText>{t('common.loading')}</EmptyText>
          </LoadingWrap>
        ) : (
          <FlatList
            data={chats}
            contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 88 }}
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
              <EmptyWrap>
                <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
                <EmptyText>{t('chats.noChats')}</EmptyText>
              </EmptyWrap>
            }
          />
        )}
      </Page>
    </SafeAreaView>
  );
}
