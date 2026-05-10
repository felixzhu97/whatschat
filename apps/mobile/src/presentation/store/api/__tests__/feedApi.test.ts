describe('feedApi', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('module structure', () => {
    it('should export feedApi module', () => {
      jest.doMock('@reduxjs/toolkit/query/react', () => ({
        createApi: jest.fn(() => ({
          reducerPath: 'feedApi',
          endpoints: {
            getFeedFirst: { name: 'getFeedFirst' },
            getFeedMore: { name: 'getFeedMore' },
            getReelsFirst: { name: 'getReelsFirst' },
            getReelsMore: { name: 'getReelsMore' },
            getStoryUsers: { name: 'getStoryUsers' },
            getStatuses: { name: 'getStatuses' },
            likePost: { name: 'likePost' },
            unlikePost: { name: 'unlikePost' },
            savePost: { name: 'savePost' },
            unsavePost: { name: 'unsavePost' },
            followUser: { name: 'followUser' },
            unfollowUser: { name: 'unfollowUser' },
            checkFollowingUsers: { name: 'checkFollowingUsers' },
            viewStatus: { name: 'viewStatus' },
            trackEvents: { name: 'trackEvents' },
            uploadMedia: { name: 'uploadMedia' },
            createPost: { name: 'createPost' },
            getPostComments: { name: 'getPostComments' },
            createPostComment: { name: 'createPostComment' },
            deletePostComment: { name: 'deletePostComment' },
          },
        })),
        fakeBaseQuery: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/composition-root', () => ({
        getFeedUseCases: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/api/client', () => ({
        apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
      }));

      const { feedApi } = require('../feedApi');

      expect(feedApi).toBeDefined();
      expect(feedApi.endpoints).toBeDefined();
      expect(feedApi.reducerPath).toBe('feedApi');
    });

    it('should export useGetFeedFirstQuery hook', () => {
      jest.doMock('@reduxjs/toolkit/query/react', () => ({
        createApi: jest.fn(() => ({
          reducerPath: 'feedApi',
          endpoints: {},
          useGetFeedFirstQuery: jest.fn(),
        })),
        fakeBaseQuery: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/composition-root', () => ({
        getFeedUseCases: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/api/client', () => ({
        apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
      }));

      const { feedApi } = require('../feedApi');

      expect(typeof feedApi.useGetFeedFirstQuery).toBe('function');
    });

    it('should export useLikePostMutation hook', () => {
      jest.doMock('@reduxjs/toolkit/query/react', () => ({
        createApi: jest.fn(() => ({
          reducerPath: 'feedApi',
          endpoints: {},
          useLikePostMutation: jest.fn(),
        })),
        fakeBaseQuery: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/composition-root', () => ({
        getFeedUseCases: jest.fn(),
      }));

      jest.doMock('@/src/infrastructure/api/client', () => ({
        apiClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
      }));

      const { feedApi } = require('../feedApi');

      expect(typeof feedApi.useLikePostMutation).toBe('function');
    });
  });
});
