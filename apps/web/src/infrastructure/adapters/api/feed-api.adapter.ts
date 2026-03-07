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

  async getPost(postId: string) {
    const res = await this.api.get<PostDetailRes>(`/posts/${postId}`);
    return res.data;
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
}
