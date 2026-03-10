import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";

export interface FeedEntryRes {
  postId: string;
  authorId: string;
  createdAt: string;
}

export interface PostDetailRes {
  postId: string;
  userId: string;
  caption: string;
  type: string;
  mediaUrls?: string[];
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

export interface CommentRes {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export class FeedApiAdapter {
  constructor(private api: IApiClient) {}

  async getFeed(limit: number, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{ entries?: FeedEntryRes[]; pageState?: string }>(`/posts/feed?${q}`);
    return {
      entries: Array.isArray((res as any).entries) ? (res as any).entries : [],
      pageState: (res as any).pageState,
    };
  }

  async getExplore(limit: number = 20, offset: number = 0) {
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const res = await this.api.get<{ entries?: FeedEntryRes[]; total?: number }>(`/posts/explore?${q}`);
    return {
      entries: Array.isArray((res as any).entries) ? (res as any).entries : [],
      total: (res as any).total ?? 0,
    };
  }

  async getPost(postId: string) {
    const res = await this.api.get<PostDetailRes>(`/posts/${postId}`);
    return (res as { data?: PostDetailRes }).data;
  }

  async likePost(postId: string) {
    await this.api.post(`/posts/${postId}/like`);
  }

  async unlikePost(postId: string) {
    await this.api.delete(`/posts/${postId}/like`);
  }

  async savePost(postId: string) {
    await this.api.post(`/posts/${postId}/save`);
  }

  async unsavePost(postId: string) {
    await this.api.delete(`/posts/${postId}/save`);
  }

  async createPost(caption: string, type: string, mediaUrls?: string[]) {
    const res = await this.api.post<{ postId: string; userId: string; createdAt: string }>("/posts", {
      caption,
      type: type || "TEXT",
      ...(mediaUrls?.length && { mediaUrls }),
    });
    return res.data;
  }

  async getComments(postId: string, page: number, limit: number) {
    const res = await this.api.get<CommentRes[]>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
    return Array.isArray((res as any).data) ? (res as any).data : [];
  }

  async addComment(postId: string, content: string, parentId?: string) {
    const res = await this.api.post<{ id: string }>(`/posts/${postId}/comments`, {
      content,
      ...(parentId && { parentId }),
    });
    return res.data;
  }

  async followUser(userId: string) {
    await this.api.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string) {
    await this.api.delete(`/users/${userId}/follow`);
  }

  async search(q: string, type: "users" | "posts" | "hashtags", limit: number) {
    const res = await this.api.get<{ hits: unknown[] }>(
      `/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`
    );
    return (res.data as { hits: unknown[] })?.hits ?? [];
  }

  async getSuggestions(limit: number = 10) {
    const res = await this.api.get<Array<{ id: string; username: string; avatar: string | null; description: string }>>(
      `/users/suggestions?limit=${limit}`
    );
    return Array.isArray((res as { data?: unknown }).data) ? (res as { data: unknown[] }).data : [];
  }

  async getFollowers(userId: string, limit: number = 20, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{
      data?: Array<{ id: string; username: string; avatar: string | null; isFollowing?: boolean }>;
      total?: number;
      pageState?: string;
    }>(`/users/${userId}/followers?${q}`);
    const r = res as { data?: unknown[]; total?: number; pageState?: string };
    return { list: Array.isArray(r.data) ? r.data : [], total: r.total ?? 0, pageState: r.pageState };
  }

  async getFollowing(userId: string, limit: number = 20, pageState?: string) {
    const q = new URLSearchParams({ limit: String(limit) });
    if (pageState) q.set("pageState", pageState);
    const res = await this.api.get<{
      data?: Array<{ id: string; username: string; avatar: string | null; isFollowing?: boolean }>;
      total?: number;
      pageState?: string;
    }>(`/users/${userId}/following?${q}`);
    const r = res as { data?: unknown[]; total?: number; pageState?: string };
    return { list: Array.isArray(r.data) ? r.data : [], total: r.total ?? 0, pageState: r.pageState };
  }

  async getProfileStats(userId: string): Promise<{ followersCount: number; followingCount: number }> {
    const res = await this.api.get<{ followersCount?: number; followingCount?: number }>(`/users/${userId}`);
    const d = (res as { data?: { followersCount?: number; followingCount?: number } }).data;
    return {
      followersCount: d?.followersCount ?? 0,
      followingCount: d?.followingCount ?? 0,
    };
  }
}
