import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { feedService, type MobileFeedPost, type MobileStoryUser } from '@/src/application/services';
import { apiClient } from '@/src/infrastructure/api/client';

type FeedPage = { posts: MobileFeedPost[]; nextPageState?: string };

type EngagementResult = {
  postId: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
};

type FollowResult = { followerId: string; followingId: string; isFollowing: boolean };

type StatusViewResult = { statusId: string; isViewed: boolean };

type AnalyticsEventInput = {
  eventName: string;
  idempotencyKey?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  context?: { userId?: string; sessionId?: string; platform?: string };
};

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Feed', 'Stories', 'Status'],
  endpoints: (build) => ({
    getFeedFirst: build.query<FeedPage, { limit: number }>({
      queryFn: async ({ limit }) => {
        try {
          const data = await feedService.getFeed(limit);
          return { data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '加载失败' } as any };
        }
      },
      providesTags: ['Feed'],
    }),
    getFeedMore: build.query<FeedPage, { limit: number; pageState: string }>({
      queryFn: async ({ limit, pageState }) => {
        try {
          const data = await feedService.getFeed(limit, pageState);
          return { data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '加载失败' } as any };
        }
      },
    }),
    getStoryUsers: build.query<MobileStoryUser[], { limit: number }>({
      queryFn: async ({ limit }) => {
        try {
          const data = await feedService.getSuggestions(limit);
          return { data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '加载失败' } as any };
        }
      },
      providesTags: ['Stories'],
    }),
    getStatuses: build.query<any[], void>({
      queryFn: async () => {
        try {
          const res = await apiClient.get<{ data: any[] }>('/status');
          return { data: Array.isArray(res.data?.data) ? res.data.data : [] };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '加载失败' } as any };
        }
      },
      providesTags: ['Status'],
    }),
    likePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<{ data: EngagementResult }>(`/posts/${postId}/like`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
            const p = draft.posts?.find((x) => x.id === postId);
            if (!p) return;
            if (!p.isLiked) {
              p.isLiked = true;
              p.likeCount = Math.max(0, (p.likeCount ?? 0) + 1);
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isLiked = true;
              p.likeCount = data.likeCount;
              p.commentCount = data.commentCount;
              p.isSaved = p.isSaved ?? data.isSaved;
            }),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    unlikePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.delete<{ data: EngagementResult }>(`/posts/${postId}/like`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
            const p = draft.posts?.find((x) => x.id === postId);
            if (!p) return;
            if (p.isLiked) {
              p.isLiked = false;
              p.likeCount = Math.max(0, (p.likeCount ?? 0) - 1);
            }
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isLiked = false;
              p.likeCount = data.likeCount;
              p.commentCount = data.commentCount;
            }),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    savePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.post<{ data: EngagementResult }>(`/posts/${postId}/save`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
            const p = draft.posts?.find((x) => x.id === postId);
            if (!p) return;
            p.isSaved = true;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isSaved = true;
              p.likeCount = data.likeCount;
              p.commentCount = data.commentCount;
            }),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    unsavePost: build.mutation<EngagementResult, { postId: string }>({
      queryFn: async ({ postId }) => {
        try {
          const res = await apiClient.delete<{ data: EngagementResult }>(`/posts/${postId}/save`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
            const p = draft.posts?.find((x) => x.id === postId);
            if (!p) return;
            p.isSaved = false;
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            feedApi.util.updateQueryData('getFeedFirst', { limit: 8 }, (draft) => {
              const p = draft.posts?.find((x) => x.id === postId);
              if (!p) return;
              p.isSaved = false;
              p.likeCount = data.likeCount;
              p.commentCount = data.commentCount;
            }),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    followUser: build.mutation<FollowResult, { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const res = await apiClient.post<{ data: FollowResult }>(`/users/${userId}/follow`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
    }),
    unfollowUser: build.mutation<FollowResult, { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const res = await apiClient.delete<{ data: FollowResult }>(`/users/${userId}/follow`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
    }),
    viewStatus: build.mutation<StatusViewResult, { statusId: string }>({
      queryFn: async ({ statusId }) => {
        try {
          const res = await apiClient.post<{ data: StatusViewResult }>(`/status/${statusId}/view`);
          return { data: res.data.data };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '操作失败' } as any };
        }
      },
      invalidatesTags: ['Status'],
    }),
    trackEvents: build.mutation<{ success: true }, { events: AnalyticsEventInput[] }>({
      queryFn: async ({ events }) => {
        try {
          await apiClient.post(`/analytics/events`, { events });
          return { data: { success: true } };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : '上报失败' } as any };
        }
      },
    }),
  }),
});

export const {
  useGetFeedFirstQuery,
  useLazyGetFeedMoreQuery,
  useGetStoryUsersQuery,
  useGetStatusesQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useViewStatusMutation,
  useTrackEventsMutation,
} = feedApi;

