import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { feedService, type MobileFeedPost, type MobileUserProfile } from '@/src/application/services';
import { ChatAvatar, ExploreGridTile } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';
import { styled } from '@/src/presentation/shared/emotion';
import { useTranslation } from '@/src/presentation/shared/i18n';
import { useFollowUserMutation, useGetStoryUsersQuery } from '@/src/presentation/store/api/feedApi';
import uniqBy from 'lodash/uniqBy';

const IG_FOLLOW = '#0095F6';

const Screen = styled.View`
  flex: 1;
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 12px;
  padding-vertical: 8px;
  min-height: 44px;
`;

const UsernameCenter = styled.Pressable`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const UsernameText = styled.Text`
  font-size: 22px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const HeaderIconBtn = styled.Pressable`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const ProfileHeader = styled.View`
  padding-horizontal: 16px;
  padding-top: 4px;
  padding-bottom: 12px;
`;

const AvatarRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
`;

const StoryBubbleWrap = styled.View`
  position: absolute;
  bottom: 100%;
  margin-bottom: 6px;
  align-self: center;
`;

const StoryBubble = styled.View`
  padding-horizontal: 10px;
  padding-vertical: 5px;
  border-radius: 12px;
  background-color: ${(p) => (p.theme as { colors?: { tertiaryBackground?: string } }).colors?.tertiaryBackground};
  border-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${(p) => (p.theme as { colors?: { separator?: string } }).colors?.separator};
`;

const StoryBubbleText = styled.Text`
  font-size: 11px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } }).colors?.secondaryText};
`;

const AvatarWrap = styled.View`
  position: relative;
`;

const AddBadge = styled.Pressable`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } }).colors?.secondaryBackground};
  border-width: 2px;
  border-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } }).colors?.secondaryBackground};
  justify-content: center;
  align-items: center;
`;

const StatsCol = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: 4px;
`;

const StatNum = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const StatLabel = styled.Text`
  font-size: 13px;
  margin-top: 2px;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const BioBlock = styled.View`
  margin-top: 12px;
`;

const DisplayName = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const HandleText = styled.Text`
  font-size: 14px;
  margin-top: 2px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } }).colors?.secondaryText};
`;

const ActionRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 14px;
  gap: 8px;
`;

const PillBtn = styled.Pressable`
  flex: 1;
  padding-vertical: 8px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => (p.theme as { colors?: { tertiaryBackground?: string } }).colors?.tertiaryBackground};
`;

const PillBtnText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const IconPill = styled.Pressable`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => (p.theme as { colors?: { tertiaryBackground?: string } }).colors?.tertiaryBackground};
`;

const SectionHead = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  margin-top: 8px;
  margin-bottom: 10px;
`;

const SectionTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const SeeAll = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${IG_FOLLOW};
`;

const DiscoverCard = styled.View`
  width: 140px;
  margin-right: 10px;
  padding: 10px;
  border-radius: 12px;
  border-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${(p) => (p.theme as { colors?: { separator?: string } }).colors?.separator};
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } }).colors?.secondaryBackground};
`;

const DiscoverClose = styled.Pressable`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  padding: 4px;
`;

const DiscoverName = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const DiscoverSub = styled.Text`
  font-size: 11px;
  margin-top: 2px;
  text-align: center;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } }).colors?.secondaryText};
`;

const FollowBtn = styled.Pressable`
  margin-top: 10px;
  padding-vertical: 7px;
  border-radius: 6px;
  align-items: center;
  background-color: ${IG_FOLLOW};
`;

const FollowBtnText = styled.Text`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`;

const TabBar = styled.View`
  flex-direction: row;
  border-top-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${(p) => (p.theme as { colors?: { separator?: string } }).colors?.separator};
`;

const TabCell = styled.Pressable`
  flex: 1;
  padding-vertical: 10px;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TabIndicator = styled.View`
  position: absolute;
  bottom: 0;
  left: 12%;
  right: 12%;
  height: 2px;
  background-color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const EmptyCenter = styled.View`
  padding-vertical: 48px;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 14px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } }).colors?.secondaryText};
`;

const CompleteBar = styled.View`
  margin-horizontal: 16px;
  margin-top: 12px;
  margin-bottom: 24px;
  padding: 12px;
  border-radius: 10px;
  background-color: ${(p) => (p.theme as { colors?: { tertiaryBackground?: string } }).colors?.tertiaryBackground};
`;

const CompleteTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } }).colors?.primaryText};
`;

const CompleteSub = styled.Text`
  font-size: 12px;
  margin-top: 4px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } }).colors?.secondaryText};
`;

type ProfileTab = 'grid' | 'reels' | 'tagged';

export const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<MobileUserProfile | null>(null);
  const [posts, setPosts] = useState<MobileFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ProfileTab>('grid');
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const { data: storyUsers } = useGetStoryUsersQuery({ limit: 16 });
  const [followUser] = useFollowUserMutation();

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [p, feed] = await Promise.all([
        feedService.getUserProfile(user.id),
        feedService.getUserPosts(user.id, 48),
      ]);
      setProfile(
        p ?? {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar ?? null,
          status: user.status ?? null,
        }
      );
      setPosts(feed.posts);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.username, user?.email, user?.avatar, user?.status]);

  useEffect(() => {
    load();
  }, [load]);

  const username = profile?.username ?? user?.username ?? '';
  const displayName = username;
  const avatarUrl = profile?.avatar ?? user?.avatar;
  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;
  const postCount = posts.length;

  const discoverList = useMemo(() => {
    const list = Array.isArray(storyUsers) ? storyUsers : [];
    return uniqBy(
      list.filter((s) => s.id && s.id !== user?.id && !dismissed[s.id]),
      'id'
    );
  }, [storyUsers, user?.id, dismissed]);

  const visiblePosts = useMemo(() => {
    if (tab === 'reels') {
      return posts.filter((p) => p.type === 'VIDEO' || Boolean(p.videoUrl));
    }
    if (tab === 'tagged') {
      return [];
    }
    return posts;
  }, [posts, tab]);

  const win = Dimensions.get('window').width;
  const pad = 2;
  const cols = 3;
  const tile = Math.floor((win - pad * (cols + 1)) / cols);

  const onShareProfile = async () => {
    try {
      await Share.share({ message: `${username}` });
    } catch {
      /* */
    }
  };

  const onFollowDiscover = async (userId: string) => {
    try {
      await followUser({ userId }).unwrap();
      setFollowed((prev) => ({ ...prev, [userId]: true }));
    } catch {
      /* */
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondaryBackground }} edges={['top']}>
        <EmptyCenter>
          <EmptyText>{t('common.loading')}</EmptyText>
        </EmptyCenter>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.secondaryBackground }} edges={['top']}>
      <Screen style={{ backgroundColor: colors.secondaryBackground }}>
        <TopRow>
          <HeaderIconBtn onPress={() => router.push('/create-post')} hitSlop={8}>
            <Ionicons name="add-outline" size={28} color={colors.primaryText} />
          </HeaderIconBtn>
          <UsernameCenter onPress={() => {}}>
            <UsernameText numberOfLines={1}>{username}</UsernameText>
            <Ionicons name="chevron-down" size={16} color={colors.primaryText} style={{ marginLeft: 4 }} />
          </UsernameCenter>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeaderIconBtn onPress={() => router.push('/inbox')} hitSlop={8}>
              <View>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primaryText} />
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.unreadColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>9+</Text>
                </View>
              </View>
            </HeaderIconBtn>
            <HeaderIconBtn onPress={() => router.push('/settings-menu')} hitSlop={8}>
              <Ionicons name="menu-outline" size={28} color={colors.primaryText} />
            </HeaderIconBtn>
          </View>
        </TopRow>

        {loading ? (
          <View style={{ paddingTop: 48 }}>
            <ActivityIndicator color={colors.primaryText} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <ProfileHeader>
              <AvatarRow>
                <View style={{ marginRight: 18 }}>
                  <StoryBubbleWrap>
                    <StoryBubble>
                      <StoryBubbleText numberOfLines={1}>
                        {(profile?.status && profile.status.trim()) || t('profile.storyPreview')}
                      </StoryBubbleText>
                    </StoryBubble>
                  </StoryBubbleWrap>
                  <AvatarWrap>
                    <ChatAvatar name={username} imageUrl={avatarUrl ?? undefined} size={86} />
                    <AddBadge onPress={() => router.push('/create-post')}>
                      <Ionicons name="add" size={16} color={colors.primaryText} />
                    </AddBadge>
                  </AvatarWrap>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <StatsCol onPress={() => {}}>
                    <StatNum>{postCount}</StatNum>
                    <StatLabel>{t('profile.posts')}</StatLabel>
                  </StatsCol>
                  <StatsCol onPress={() => {}}>
                    <StatNum>{followersCount}</StatNum>
                    <StatLabel>{t('profile.followers')}</StatLabel>
                  </StatsCol>
                  <StatsCol onPress={() => {}}>
                    <StatNum>{followingCount}</StatNum>
                    <StatLabel>{t('profile.followingStat')}</StatLabel>
                  </StatsCol>
                </View>
              </AvatarRow>
              <BioBlock>
                <DisplayName numberOfLines={2}>{displayName}</DisplayName>
                <HandleText numberOfLines={1}>@ {username}</HandleText>
              </BioBlock>
              <ActionRow>
                <PillBtn onPress={() => {}}>
                  <PillBtnText>{t('profile.editProfile')}</PillBtnText>
                </PillBtn>
                <PillBtn onPress={onShareProfile}>
                  <PillBtnText>{t('profile.shareProfile')}</PillBtnText>
                </PillBtn>
                <IconPill onPress={() => router.push('/explore')}>
                  <Ionicons name="person-add-outline" size={20} color={colors.primaryText} />
                </IconPill>
              </ActionRow>
            </ProfileHeader>

            {discoverList.length > 0 ? (
              <>
                <SectionHead>
                  <SectionTitle>{t('profile.discoverPeople')}</SectionTitle>
                  <Pressable onPress={() => router.push('/explore')}>
                    <SeeAll>{t('profile.seeAll')}</SeeAll>
                  </Pressable>
                </SectionHead>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
                >
                  {discoverList.map((s) => (
                    <DiscoverCard key={s.id}>
                      <DiscoverClose
                        onPress={() => setDismissed((prev) => ({ ...prev, [s.id]: true }))}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={16} color={colors.secondaryText} />
                      </DiscoverClose>
                      <View style={{ alignItems: 'center' }}>
                        {s.avatar ? (
                          <Image
                            source={{ uri: s.avatar }}
                            style={{ width: 72, height: 72, borderRadius: 36 }}
                          />
                        ) : (
                          <ChatAvatar name={s.username} size={72} />
                        )}
                        <DiscoverName numberOfLines={1}>{s.username}</DiscoverName>
                        <DiscoverSub numberOfLines={2}>{t('profile.suggestedForYou')}</DiscoverSub>
                        <FollowBtn
                          onPress={() => onFollowDiscover(s.id)}
                          disabled={Boolean(followed[s.id])}
                          style={{ opacity: followed[s.id] ? 0.5 : 1 }}
                        >
                          <FollowBtnText>
                            {followed[s.id] ? t('profile.following') : t('feed.follow')}
                          </FollowBtnText>
                        </FollowBtn>
                      </View>
                    </DiscoverCard>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <TabBar style={{ marginTop: discoverList.length ? 8 : 4 }}>
              <TabCell onPress={() => setTab('grid')}>
                <Ionicons
                  name={tab === 'grid' ? 'grid' : 'grid-outline'}
                  size={26}
                  color={colors.primaryText}
                />
                {tab === 'grid' ? <TabIndicator /> : null}
              </TabCell>
              <TabCell onPress={() => setTab('reels')}>
                <Ionicons
                  name={tab === 'reels' ? 'film' : 'film-outline'}
                  size={26}
                  color={colors.primaryText}
                />
                {tab === 'reels' ? <TabIndicator /> : null}
              </TabCell>
              <TabCell onPress={() => setTab('tagged')}>
                <Ionicons
                  name={tab === 'tagged' ? 'person' : 'person-outline'}
                  size={26}
                  color={colors.primaryText}
                />
                {tab === 'tagged' ? <TabIndicator /> : null}
              </TabCell>
            </TabBar>

            {tab === 'tagged' ? (
              <EmptyCenter>
                <EmptyText>{t('profile.noTaggedPosts')}</EmptyText>
              </EmptyCenter>
            ) : visiblePosts.length === 0 ? (
              <EmptyCenter>
                <EmptyText>{t('home.empty')}</EmptyText>
              </EmptyCenter>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: pad }}>
                {visiblePosts.map((post, index) => (
                  <ExploreGridTile
                    key={post.id}
                    post={post}
                    tileSize={tile}
                    marginRight={(index + 1) % cols === 0 ? 0 : pad}
                    marginBottom={pad}
                    onPress={() =>
                      router.push({
                        pathname: '/media-viewer',
                        params: { postId: post.id, index: String(index) },
                      } as never)
                    }
                  />
                ))}
              </View>
            )}

            <CompleteBar>
              <CompleteTitle>{t('profile.completeProfile')}</CompleteTitle>
              <CompleteSub>{t('profile.completeProfileProgress')}</CompleteSub>
            </CompleteBar>
          </ScrollView>
        )}
      </Screen>
    </SafeAreaView>
  );
};
