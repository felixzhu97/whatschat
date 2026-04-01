import type { FeedPost } from '../entities/feed-post';
import type { StoryUser } from '../entities/story-user';
import type { UserProfile } from '../entities/user-profile';

export interface IFeedRepository {
  getFeed(limit: number, pageState?: string): Promise<{ posts: FeedPost[]; nextPageState?: string }>;
  getReels(limit: number, pageState?: string): Promise<{ posts: FeedPost[]; nextPageState?: string }>;
  getSuggestions(limit: number): Promise<StoryUser[]>;
  getPostById(postId: string): Promise<FeedPost | null>;
  getExplore(
    limit: number,
    offset: number,
  ): Promise<{ posts: FeedPost[]; total: number; fetchedEntryCount: number }>;
  searchPosts(
    q: string,
    limit: number,
    cursor?: string,
  ): Promise<{ posts: FeedPost[]; nextCursor?: string; total?: number }>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  getUserPosts(
    userId: string,
    limit: number,
    pageState?: string,
  ): Promise<{ posts: FeedPost[]; nextPageState?: string }>;
}
