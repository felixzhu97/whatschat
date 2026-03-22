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

export interface MobileUserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  status?: string | null;
  followersCount?: number;
  followingCount?: number;
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
    reels?: {
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
    const feedGraphRes = await apiClient.post<FeedGraphqlBody>('/graphql', { query, variables });
    const body = feedGraphRes.data;
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

  async getReels(limit: number, pageState?: string) {
    const query = `query Reels($limit: Int, $pageState: String) {
      reels(limit: $limit, pageState: $pageState) {
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
    const reelsGraphRes = await apiClient.post<FeedGraphqlBody>('/graphql', { query, variables });
    const body = reelsGraphRes.data;
    if (body.errors?.length) {
      throw new Error(body.errors[0]?.message ?? 'GraphQL error');
    }
    const reels = body.data?.reels;
    const entries = Array.isArray(reels?.entries) ? reels?.entries : [];
    const posts = entries
      .map((e) => e.post)
      .filter((p): p is FeedPostRes => Boolean(p))
      .map(mapFeedPost);
    const next = reels?.pageState ?? undefined;
    return {
      posts,
      nextPageState: next && next !== '' ? next : undefined,
    };
  }

  async getSuggestions(limit: number) {
    const suggestionsRes = await apiClient.get<{
      data?: Array<{ id: string; username: string; avatar: string | null; description: string }>;
    }>(`/users/suggestions?limit=${limit}`);
    const list = Array.isArray(suggestionsRes.data?.data) ? suggestionsRes.data?.data ?? [] : [];
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

  async getPostById(postId: string): Promise<MobileFeedPost | null> {
    try {
      const postRes = await apiClient.get<{ data?: FeedPostRes }>(`/posts/${postId}`);
      const raw = postRes.data?.data;
      if (!raw?.postId) return null;
      const createdAt =
        typeof raw.createdAt === 'string'
          ? raw.createdAt
          : raw.createdAt != null
            ? String(raw.createdAt)
            : '';
      return mapFeedPost({ ...(raw as FeedPostRes), createdAt });
    } catch {
      return null;
    }
  }

  async getExplore(
    limit: number,
    offset: number
  ): Promise<{ posts: MobileFeedPost[]; total: number; fetchedEntryCount: number }> {
    const exploreRes = await apiClient.get<{
      entries?: Array<{ postId: string; isSponsored?: boolean }>;
      total?: number;
      data?: { entries?: Array<{ postId: string; isSponsored?: boolean }>; total?: number };
    }>(`/posts/explore?limit=${limit}&offset=${offset}`);
    const top = exploreRes.data as {
      entries?: Array<{ postId: string; isSponsored?: boolean }>;
      total?: number;
      data?: { entries?: Array<{ postId: string; isSponsored?: boolean }>; total?: number };
    };
    const rawEntries = Array.isArray(top.entries)
      ? top.entries
      : Array.isArray(top.data?.entries)
        ? top.data.entries
        : [];
    const filtered = rawEntries.filter((e) => !e.isSponsored);
    const entries = filtered.length > 0 ? filtered : rawEntries;
    const total =
      typeof top.total === 'number'
        ? top.total
        : typeof top.data?.total === 'number'
          ? top.data.total
          : 0;
    const postIds = entries.map((e) => e.postId).filter(Boolean);
    const details = await Promise.all(postIds.map((id) => this.getPostById(id)));
    const posts = details.filter((p): p is MobileFeedPost => p != null);
    return { posts, total, fetchedEntryCount: rawEntries.length };
  }

  async searchPosts(
    q: string,
    limit: number,
    cursor?: string
  ): Promise<{ posts: MobileFeedPost[]; nextCursor?: string; total?: number }> {
    const trimmed = q.trim();
    if (!trimmed) return { posts: [] };
    const params = new URLSearchParams({
      q: trimmed,
      type: 'posts',
      limit: String(limit),
    });
    if (cursor) params.set('cursor', cursor);
    const searchRes = await apiClient.get<{
      data?: { hits: unknown[]; nextCursor?: string; total?: number };
    }>(`/search?${params.toString()}`);
    const payload = searchRes.data?.data;
    const hits = Array.isArray(payload?.hits) ? payload.hits : [];
    const nextCursor = payload?.nextCursor;
    const total = payload?.total;
    const orderedIds = hits
      .map((h) => {
        const o = h as Record<string, unknown>;
        return String(o.postId ?? o.id ?? '');
      })
      .filter(Boolean);
    const unique = [...new Set(orderedIds)];
    const loaded = await Promise.all(unique.map((id) => this.getPostById(id)));
    const byId = new Map(loaded.filter((p): p is MobileFeedPost => p != null).map((p) => [p.id, p]));
    const posts = orderedIds.map((id) => byId.get(id)).filter((p): p is MobileFeedPost => p != null);
    return { posts, nextCursor, total };
  }

  async getUserProfile(userId: string): Promise<MobileUserProfile | null> {
    try {
      const profileRes = await apiClient.get<{ data?: MobileUserProfile }>(`/users/${userId}`);
      const u = profileRes.data?.data;
      if (!u || typeof u !== 'object') return null;
      return u as MobileUserProfile;
    } catch {
      return null;
    }
  }

  async getUserPosts(
    userId: string,
    limit: number,
    pageState?: string
  ): Promise<{ posts: MobileFeedPost[]; nextPageState?: string }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (pageState) params.set('pageState', pageState);
    const userPostsRes = await apiClient.get<{
      posts?: FeedPostRes[];
      pageState?: string | null;
      data?: { posts?: FeedPostRes[]; pageState?: string | null };
    }>(`/posts/user/${userId}?${params.toString()}`);
    const body = userPostsRes.data as {
      posts?: FeedPostRes[];
      pageState?: string | null;
      data?: { posts?: FeedPostRes[]; pageState?: string | null };
    };
    const rawPosts = Array.isArray(body.posts)
      ? body.posts
      : Array.isArray(body.data?.posts)
        ? body.data.posts
        : [];
    const next = body.pageState ?? body.data?.pageState;
    const posts = rawPosts.map((r) => {
      const createdAt =
        typeof r.createdAt === 'string'
          ? r.createdAt
          : r.createdAt != null
            ? String(r.createdAt)
            : '';
      return mapFeedPost({ ...(r as FeedPostRes), createdAt });
    });
    return { posts, nextPageState: next && next !== '' ? String(next) : undefined };
  }
}

export const feedService = new FeedService();

