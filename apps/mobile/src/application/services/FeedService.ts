import { apiClient } from '@/src/infrastructure/api/client';

export interface MobileFeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  imageUrl: string;
  isLiked: boolean;
  isSaved: boolean;
  type?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  mediaUrls: string[];
}

export interface MobileStoryUser {
  id: string;
  username: string;
  avatar: string;
}

interface FeedPostRes {
  postId: string;
  userId: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
  coverUrl?: string;
  location?: string;
  createdAt: string;
  username?: string;
  avatar?: string;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface FeedGraphqlBody {
  errors?: Array<{ message?: string }>;
  data?: {
    feed?: {
      pageState?: string | null;
      entries?: Array<{
        postId: string;
        post?: FeedPostRes | null;
      }>;
    };
  };
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|$)/i;

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return /^data:video\//i.test(url);
  return VIDEO_EXT.test(url);
}

function mapFeedPost(raw: FeedPostRes): MobileFeedPost {
  const urls = raw.mediaUrls ?? [];
  const first = urls[0];
  const isVideoType = raw.type === 'VIDEO' || (first != null && isVideoUrl(first));

  let imageUrl = first ?? '';
  let videoUrl: string | undefined;
  let coverImageUrl: string | undefined;
  const storedCover = raw.coverUrl != null && raw.coverUrl !== '' ? raw.coverUrl : undefined;

  if (isVideoType && first && isVideoUrl(first)) {
    videoUrl = first;
    const poster = storedCover ?? urls.find((u) => u && !isVideoUrl(u));
    if (poster) {
      coverImageUrl = poster;
      imageUrl = poster;
    } else {
      coverImageUrl = undefined;
      imageUrl = first;
    }
  }

  return {
    id: raw.postId,
    userId: raw.userId,
    username: raw.username ?? raw.userId?.slice(0, 8) ?? '',
    avatar: raw.avatar ?? '',
    timestamp: raw.createdAt,
    caption: raw.caption ?? '',
    likeCount: raw.likeCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    imageUrl,
    isLiked: Boolean(raw.isLiked),
    isSaved: Boolean(raw.isSaved),
    type: raw.type,
    videoUrl,
    coverImageUrl,
    mediaUrls: urls,
  };
}

export class FeedService {
  async getFeed(limit: number, pageState?: string) {
    const query = `query Feed($limit: Int, $pageState: String) {
      feed(limit: $limit, pageState: $pageState) {
        pageState
        entries {
          postId
          post {
            postId
            userId
            caption
            type
            mediaUrls
            coverUrl
            location
            createdAt
            username
            avatar
            likeCount
            commentCount
            saveCount
            isLiked
            isSaved
            autoTags
          }
        }
      }
    }`;
    const variables: { limit: number; pageState?: string } = { limit };
    if (pageState) variables.pageState = pageState;
    const res = await apiClient.post<FeedGraphqlBody>('/graphql', { query, variables });
    const body = res.data;
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }
    const feed = body.data?.feed;
    const entries = Array.isArray(feed?.entries) ? feed?.entries : [];
    const posts = entries
      .map((e) => e.post)
      .filter((p): p is FeedPostRes => Boolean(p))
      .map(mapFeedPost);
    const next = feed?.pageState ?? undefined;
    return {
      posts,
      nextPageState: next && next !== '' ? next : undefined,
    };
  }

  async getSuggestions(limit: number) {
    const res = await apiClient.get<{
      data?: Array<{ id: string; username: string; avatar: string | null; description: string }>;
    }>(`/users/suggestions?limit=${limit}`);
    const list = Array.isArray(res.data?.data) ? res.data?.data ?? [] : [];
    const seen = new Set<string>();
    return list
      .filter((u) => {
        if (!u.id || seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      })
      .map<MobileStoryUser>((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar ?? '',
      }));
  }
}

export const feedService = new FeedService();

