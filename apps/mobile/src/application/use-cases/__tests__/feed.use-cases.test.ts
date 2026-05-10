import { FeedUseCases } from '../feed.use-cases';

describe('FeedUseCases', () => {
  const mockFeedRepository = {
    getFeed: jest.fn(),
    getReels: jest.fn(),
    getSuggestions: jest.fn(),
    getPostById: jest.fn(),
    getExplore: jest.fn(),
    searchPosts: jest.fn(),
    getUserProfile: jest.fn(),
    getUserPosts: jest.fn(),
  };

  const feedUseCases = new FeedUseCases(mockFeedRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('calls repository with limit and pageState', async () => {
      const mockResult = { posts: [], nextPageState: undefined };
      mockFeedRepository.getFeed.mockResolvedValue(mockResult);

      const result = await feedUseCases.getFeed(10, 'cursor123');

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.getFeed).toHaveBeenCalledWith(10, 'cursor123');
    });

    it('works without pageState', async () => {
      const mockResult = { posts: [], nextPageState: undefined };
      mockFeedRepository.getFeed.mockResolvedValue(mockResult);

      const result = await feedUseCases.getFeed(10);

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.getFeed).toHaveBeenCalledWith(10, undefined);
    });

    it('propagates errors from repository', async () => {
      mockFeedRepository.getFeed.mockRejectedValue(new Error('Network error'));

      await expect(feedUseCases.getFeed(10)).rejects.toThrow('Network error');
    });
  });

  describe('getReels', () => {
    it('calls repository with limit and pageState', async () => {
      const mockResult = { posts: [], nextPageState: undefined };
      mockFeedRepository.getReels.mockResolvedValue(mockResult);

      const result = await feedUseCases.getReels(20, 'reelCursor');

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.getReels).toHaveBeenCalledWith(20, 'reelCursor');
    });
  });

  describe('getSuggestions', () => {
    it('calls repository with limit', async () => {
      const mockSuggestions = [{ id: '1', username: 'user1' }];
      mockFeedRepository.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await feedUseCases.getSuggestions(12);

      expect(result).toEqual(mockSuggestions);
      expect(mockFeedRepository.getSuggestions).toHaveBeenCalledWith(12);
    });
  });

  describe('getPostById', () => {
    it('returns post by id', async () => {
      const mockPost = { id: 'post-1', caption: 'Test' };
      mockFeedRepository.getPostById.mockResolvedValue(mockPost);

      const result = await feedUseCases.getPostById('post-1');

      expect(result).toEqual(mockPost);
      expect(mockFeedRepository.getPostById).toHaveBeenCalledWith('post-1');
    });
  });

  describe('getExplore', () => {
    it('calls repository with limit and offset', async () => {
      const mockResult = { posts: [] };
      mockFeedRepository.getExplore.mockResolvedValue(mockResult);

      const result = await feedUseCases.getExplore(20, 40);

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.getExplore).toHaveBeenCalledWith(20, 40);
    });
  });

  describe('searchPosts', () => {
    it('calls repository with query, limit, and cursor', async () => {
      const mockResult = { posts: [] };
      mockFeedRepository.searchPosts.mockResolvedValue(mockResult);

      const result = await feedUseCases.searchPosts('query', 10, 'searchCursor');

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.searchPosts).toHaveBeenCalledWith('query', 10, 'searchCursor');
    });

    it('works without cursor', async () => {
      const mockResult = { posts: [] };
      mockFeedRepository.searchPosts.mockResolvedValue(mockResult);

      const result = await feedUseCases.searchPosts('query', 10);

      expect(mockFeedRepository.searchPosts).toHaveBeenCalledWith('query', 10, undefined);
    });
  });

  describe('getUserProfile', () => {
    it('returns user profile by id', async () => {
      const mockProfile = { id: 'user-1', username: 'testuser' };
      mockFeedRepository.getUserProfile.mockResolvedValue(mockProfile);

      const result = await feedUseCases.getUserProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockFeedRepository.getUserProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getUserPosts', () => {
    it('calls repository with userId, limit, and pageState', async () => {
      const mockResult = { posts: [] };
      mockFeedRepository.getUserPosts.mockResolvedValue(mockResult);

      const result = await feedUseCases.getUserPosts('user-1', 20, 'userCursor');

      expect(result).toEqual(mockResult);
      expect(mockFeedRepository.getUserPosts).toHaveBeenCalledWith('user-1', 20, 'userCursor');
    });

    it('works without pageState', async () => {
      const mockResult = { posts: [] };
      mockFeedRepository.getUserPosts.mockResolvedValue(mockResult);

      const result = await feedUseCases.getUserPosts('user-1', 20);

      expect(mockFeedRepository.getUserPosts).toHaveBeenCalledWith('user-1', 20, undefined);
    });
  });
});
