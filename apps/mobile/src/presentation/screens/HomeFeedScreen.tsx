import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { FeedPostCard } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useTranslation } from '@/src/presentation/shared/i18n';
import { useMobileFeed } from '@/src/presentation/hooks/useMobileFeed';
import { useMobileStories } from '@/src/presentation/hooks/useMobileStories';

const Page = styled.View`
  flex: 1;
  background-color: (p: { theme: { colors: { background: string } } }) =>
    p.theme.colors.background;
`;

const Header = styled.View`
  padding: 8px 12px 6px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: (p: { theme: { colors: { primaryText: string } } }) => p.theme.colors.primaryText;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderIconButton = styled.TouchableOpacity`
  padding: 4px;
  margin-left: 12px;
`;

const StoriesContainer = styled.View`
  padding-vertical: 8px;
`;

const StoriesListBase = styled.View`
  padding-left: 8px;
`;

const StoryItem = styled.View`
  width: 70px;
  align-items: center;
  margin-right: 8px;
`;

const StoryAvatarWrap = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
`;

const StoryAvatarInner = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  overflow: hidden;
  background-color: (p: { theme: { colors: { tertiaryBackground: string } } }) =>
    p.theme.colors.tertiaryBackground;
`;

const StoryAvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const StoryName = styled.Text`
  font-size: 11px;
  color: (p: { theme: { colors: { primaryText: string } } }) => p.theme.colors.primaryText;
`;

const ListHeader = styled.View`
  background-color: (p: { theme: { colors: { background: string } } }) =>
    p.theme.colors.background;
  padding-bottom: 8px;
`;

const LoadingMore = styled.View`
  padding-vertical: 12px;
`;

const EmptyState = styled.View`
  padding-vertical: 40px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: (p: { theme: { colors: { secondaryText: string } } }) => p.theme.colors.secondaryText;
  margin-top: 8px;
`;

export const HomeFeedScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { items, initialLoading, loadingMore, load, refresh } = useMobileFeed();
  const { items: storyItems } = useMobileStories();
  const [refreshing, setRefreshing] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const listRef = useRef<FlatList<any> | null>(null);
  const navigation = useNavigation();

  useScrollToTop(listRef);

  const viewabilityConfig = { itemVisiblePercentThreshold: 70 };
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const first = viewableItems.find((v) => v.isViewable && v.item?.id);
      if (first && typeof first.item.id === 'string') {
        setActivePostId(first.item.id);
      } else {
        setActivePostId(null);
      }
    },
  );

  useEffect(() => {
    load(true);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (listRef.current) {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
          renderItem={({ item }) => (
            <FeedPostCard post={item} isActive={item.id === activePostId} />
          )}
          ListHeaderComponent={
            <ListHeader>
              <Header>
                <HeaderTitle>Instagram</HeaderTitle>
                <HeaderRight>
                  <HeaderIconButton>
                    <Ionicons name="add-circle-outline" size={24} color={colors.primaryText} />
                  </HeaderIconButton>
                  <HeaderIconButton>
                    <Ionicons name="heart-outline" size={24} color={colors.primaryText} />
                  </HeaderIconButton>
                  <HeaderIconButton>
                    <Ionicons name="paper-plane-outline" size={24} color={colors.primaryText} />
                  </HeaderIconButton>
                </HeaderRight>
              </Header>
              <StoriesContainer>
                <FlatList
                  data={storyItems}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                  renderItem={({ item }) => (
                    <StoryItem>
                      <StoryAvatarWrap>
                        <StoryAvatarInner>
                          <StoryAvatarImage
                            source={{ uri: item.avatar || undefined }}
                            resizeMode="cover"
                          />
                        </StoryAvatarInner>
                      </StoryAvatarWrap>
                      <StoryName numberOfLines={1}>{item.username}</StoryName>
                    </StoryItem>
                  )}
                />
              </StoriesContainer>
            </ListHeader>
          }
          ListFooterComponent={
            loadingMore ? (
              <LoadingMore>
                <ActivityIndicator size="small" color={colors.primaryGreen} />
              </LoadingMore>
            ) : null
          }
          ListEmptyComponent={
            !initialLoading ? (
              <EmptyState>
                <Ionicons name="image-outline" size={40} color={colors.secondaryText} />
                <EmptyText>{t('home.empty')}</EmptyText>
              </EmptyState>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing || initialLoading}
              onRefresh={async () => {
                setRefreshing(true);
                await refresh();
                setRefreshing(false);
              }}
              tintColor={colors.primaryGreen}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loadingMore) {
              load(false);
            }
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged.current}
        />
      </Page>
    </SafeAreaView>
  );
};

