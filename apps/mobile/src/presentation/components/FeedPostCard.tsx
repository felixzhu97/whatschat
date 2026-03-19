import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useTranslation } from '@/src/presentation/shared/i18n';
import type { MobileFeedPost } from '@/src/application/services';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';

const Card = styled.View`
  background-color: ${(p) => (p as { theme: { colors: { secondaryBackground: string } } }).theme.colors.secondaryBackground};
  margin-bottom: 24px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px 12px;
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AvatarWrap = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin-right: 8px;
  background-color: ${(p) => (p as { theme: { colors: { tertiaryBackground: string } } }).theme.colors.tertiaryBackground};
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const HeaderText = styled.View`
  justify-content: center;
`;

const Username = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => (p as { theme: { colors: { primaryText: string } } }).theme.colors.primaryText};
`;

const MetaText = styled.Text`
  font-size: 12px;
  color: ${(p) => (p as { theme: { colors: { secondaryText: string } } }).theme.colors.secondaryText};
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const FollowButton = styled.TouchableOpacity`
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${(p) => (p as { theme: { colors: { iosBlue: string } } }).theme.colors.iosBlue};
  margin-right: 8px;
`;

const FollowText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p as { theme: { colors: { iosBlue: string } } }).theme.colors.iosBlue};
`;

const Media = styled.View`
  width: 100%;
  aspect-ratio: 4 / 5;
  background-color: (p) =>
    (p as { theme: { colors: { tertiaryBackground: string } } }).theme.colors.tertiaryBackground;
`;

const MediaPage = styled.View`
  width: 100%;
  height: 100%;
`;

const MediaImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const PlayIconWrap = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const VideoWrapper = styled.View`
  width: 100%;
  height: 100%;
`;

const PostVideo: React.FC<{ uri: string; isActive: boolean }> = ({ uri, isActive }) => {
  const [muted, setMuted] = useState(true);
  const player = useVideoPlayer(
    { uri },
    (p) => {
      p.loop = true;
      p.muted = true;
      p.pause();
    },
  );

  React.useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }
    player.play();
  }, [isActive, player]);

  React.useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <VideoWrapper>
      <TouchableOpacity
        activeOpacity={0.85}
        style={{ width: '100%', height: '100%' }}
        onPress={() => setMuted((m) => !m)}
      >
        <VideoView
          style={{ width: '100%', height: '100%' }}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
        <PlayIconWrap>
          <Ionicons
            name={muted ? 'volume-mute' : 'volume-high'}
            size={22}
            color="#FFFFFF"
          />
        </PlayIconWrap>
      </TouchableOpacity>
    </VideoWrapper>
  );
};

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 4px 12px;
`;

const ActionsLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconButton = styled(TouchableOpacity)`
  padding-vertical: 4px;
  padding-horizontal: 4px;
  margin-right: 8px;
`;

const Footer = styled.View`
  padding: 0 12px 10px 12px;
`;

const StatText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p as { theme: { colors: { primaryText: string } } }).theme.colors.primaryText};
  margin-bottom: 2px;
`;

const CaptionText = styled.Text`
  font-size: 13px;
  color: ${(p) => (p as { theme: { colors: { primaryText: string } } }).theme.colors.primaryText};
  margin-bottom: 2px;
`;

const TimeText = styled.Text`
  font-size: 11px;
  color: ${(p) => (p as { theme: { colors: { secondaryText: string } } }).theme.colors.secondaryText};
`;

interface FeedPostCardProps {
  post: MobileFeedPost;
  onPressLike?: (id: string) => void;
  onPressComment?: (id: string) => void;
  onPressShare?: (id: string) => void;
  onPressSave?: (id: string) => void;
  onPressFollow?: (userId: string) => void;
  currentUserId?: string;
  isFollowing?: boolean;
  onPressMedia?: (postId: string, index: number) => void;
  isActive?: boolean;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onPressLike,
  onPressComment,
  onPressShare,
  onPressSave,
  onPressFollow,
  currentUserId,
  isFollowing,
  onPressMedia,
  isActive = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isSelf = currentUserId != null && post.userId === currentUserId;
  const following = Boolean(isFollowing);
  const screenWidth = Dimensions.get('window').width;
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const lastTap = useRef<number>(0);
  const likeIcon = post.isLiked ? 'heart' : 'heart-outline';
  const likeColor = post.isLiked ? colors.iosRed : colors.primaryText;
  const saveIcon = post.isSaved ? 'bookmark' : 'bookmark-outline';
  const isVideo = post.type === 'VIDEO' && !!post.videoUrl;
  const isHttpVideo = isVideo && /^https?:\/\//i.test(post.videoUrl as string);
  const isDataVideo = isVideo && post.videoUrl?.startsWith('data:video/');
  const mediaUrls = Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 ? post.mediaUrls : [];
  const hasCarousel = mediaUrls.length > 1;
  const safeLikeCount =
    typeof post.likeCount === 'number' && !Number.isNaN(post.likeCount) ? post.likeCount : 0;
  const likeText = useMemo(
    () => `${safeLikeCount} ${t('feed.likeLabel')}`,
    [safeLikeCount, t],
  );

  const isMediaVideoUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    if (url.startsWith('data:')) return false;
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  };

  const handleHorizontalMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    if (!layoutMeasurement?.width) return;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    if (index !== activeMediaIndex) {
      setActiveMediaIndex(index);
    }
  };

  return (
    <Card>
      <Header>
        <HeaderLeft>
          <AvatarWrap>
            <AvatarImage source={{ uri: post.avatar || undefined }} resizeMode="cover" />
          </AvatarWrap>
          <HeaderText>
            <Username numberOfLines={1}>{post.username}</Username>
            <MetaText numberOfLines={1}>{post.caption}</MetaText>
          </HeaderText>
        </HeaderLeft>
        <HeaderRight>
          {isSelf ? null : (
            <FollowButton onPress={() => onPressFollow?.(post.userId)}>
              <FollowText>{following ? t('feed.unfollow') : t('feed.follow')}</FollowText>
            </FollowButton>
          )}
          <IconButton
            onPress={() => {
              if (Platform.OS !== 'ios') return;
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: [t('feed.copyLink'), t('feed.report'), t('common.cancel')],
                  cancelButtonIndex: 2,
                  destructiveButtonIndex: 1,
                },
                () => {},
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.primaryText} />
          </IconButton>
        </HeaderRight>
      </Header>
      <TouchableOpacity
        activeOpacity={0.96}
        onPress={() => {
          const now = Date.now();
          if (now - lastTap.current < 280) {
            onPressLike?.(post.id);
          } else {
            onPressMedia?.(post.id, activeMediaIndex);
          }
          lastTap.current = now;
        }}
      >
        <Media>
        {hasCarousel ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: '100%', height: '100%' }}
            onMomentumScrollEnd={handleHorizontalMomentumEnd}
          >
            {mediaUrls.map((url, index) => {
              const isMediaVideo = isMediaVideoUrl(url);
              const isDataMediaVideo = url?.startsWith('data:video/');
              return (
                <MediaPage key={`${url}-${index}`} style={{ width: screenWidth }}>
                  {isMediaVideo ? (
                    isDataMediaVideo ? (
                      <WebView
                        source={{
                          html: `
                            <html>
                              <head>
                                <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
                                <style>
                                  body,html{margin:0;padding:0;background:black;}
                                  video{width:100%;height:100%;object-fit:cover;}
                                </style>
                              </head>
                              <body>
                                <video src="${url}" autoplay muted playsinline loop></video>
                              </body>
                            </html>
                          `,
                        }}
                        style={{ width: '100%', height: '100%' }}
                        javaScriptEnabled
                        scrollEnabled={false}
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                      />
                    ) : (
                      <PostVideo uri={url} isActive={isActive && index === activeMediaIndex} />
                    )
                  ) : (
                    <MediaImage source={{ uri: url }} resizeMode="cover" />
                  )}
                </MediaPage>
              );
            })}
          </ScrollView>
        ) : isVideo && isHttpVideo && post.videoUrl ? (
          <PostVideo uri={post.videoUrl} isActive={isActive} />
        ) : isVideo && isDataVideo && post.videoUrl ? (
          <WebView
            source={{
              html: `
                <html>
                  <head>
                    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
                    <style>
                      body,html{margin:0;padding:0;background:black;}
                      video{width:100%;height:100%;object-fit:cover;}
                    </style>
                  </head>
                  <body>
                    <video id="v" src="${post.videoUrl}" autoplay muted playsinline loop></video>
                    <script>
                      (function() {
                        var currentActive = false;
                        function setActive(active) {
                          currentActive = !!active;
                          var v = document.getElementById('v');
                          if (!v) return;
                          if (currentActive) {
                            v.play();
                          } else {
                            v.pause();
                          }
                        }
                        window.setActive = setActive;
                      })();
                    </script>
                  </body>
                </html>
              `,
            }}
            style={{ width: '100%', height: '100%' }}
            javaScriptEnabled
            scrollEnabled={false}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <MediaImage source={{ uri: post.imageUrl || undefined }} resizeMode="cover" />
        )}
        </Media>
      </TouchableOpacity>
      <Actions>
        <ActionsLeft>
          <IconButton onPress={() => onPressLike?.(post.id)}>
            <Ionicons name={likeIcon} size={22} color={likeColor} />
          </IconButton>
          <IconButton onPress={() => onPressComment?.(post.id)}>
            <Ionicons name="chatbubble-outline" size={22} color={colors.primaryText} />
          </IconButton>
          <IconButton onPress={() => onPressShare?.(post.id)}>
            <Ionicons name="paper-plane-outline" size={22} color={colors.primaryText} />
          </IconButton>
        </ActionsLeft>
        <IconButton onPress={() => onPressSave?.(post.id)}>
          <Ionicons name={saveIcon} size={22} color={colors.primaryText} />
        </IconButton>
      </Actions>
      <Footer>
        <StatText numberOfLines={1}>{likeText}</StatText>
        {post.caption ? (
          <CaptionText numberOfLines={2}>{post.caption}</CaptionText>
        ) : null}
        <TimeText numberOfLines={1}>{post.timestamp}</TimeText>
      </Footer>
    </Card>
  );
};

