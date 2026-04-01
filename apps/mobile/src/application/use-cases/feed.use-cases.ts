import type { IFeedRepository } from '@/src/domain/ports/feed.repository.port';

export class FeedUseCases {
  constructor(private readonly feedRepository: IFeedRepository) {}

  getFeed(limit: number, pageState?: string) {
    return this.feedRepository.getFeed(limit, pageState);
  }

  getReels(limit: number, pageState?: string) {
    return this.feedRepository.getReels(limit, pageState);
  }

  getSuggestions(limit: number) {
    return this.feedRepository.getSuggestions(limit);
  }

  getPostById(postId: string) {
    return this.feedRepository.getPostById(postId);
  }

  getExplore(limit: number, offset: number) {
    return this.feedRepository.getExplore(limit, offset);
  }

  searchPosts(q: string, limit: number, cursor?: string) {
    return this.feedRepository.searchPosts(q, limit, cursor);
  }

  getUserProfile(userId: string) {
    return this.feedRepository.getUserProfile(userId);
  }

  getUserPosts(userId: string, limit: number, pageState?: string) {
    return this.feedRepository.getUserPosts(userId, limit, pageState);
  }
}
