"use client";

import { useState, useCallback } from "react";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";
import type { FeedPost, SuggestedUser } from "@/shared/types";

const api = new FeedApiAdapter(getApiClient());

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return `${Math.floor(diff / 604800000)}周前`;
}

function toSuggestedUser(raw: { id: string; username: string; avatar: string | null; description: string }): SuggestedUser {
  return {
    id: raw.id,
    username: raw.username,
    avatar: raw.avatar ?? "",
    description: raw.description,
  };
}

export function useFeed(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const { entries, pageState: next } = await api.getFeed(20, pageState);
      setPageState(next);
      const details = await Promise.all(
        entries.map((e) => api.getPost(e.postId).catch(() => null))
      );
      const list: FeedPost[] = details
        .filter(Boolean)
        .map((p: any) => ({
          id: p.postId,
          userId: p.userId,
          username: p.username ?? p.userId?.slice(0, 8) ?? "",
          avatar: p.avatar ?? "/placeholder.svg?height=32&width=32",
          timestamp: formatTime(p.createdAt),
          imageUrl: p.mediaUrls?.[0] ?? "/placeholder.svg?height=600&width=600",
          likeCount: String(p.likeCount ?? 0),
          commentCount: String(p.commentCount ?? 0),
          caption: p.caption ?? "",
          isLiked: Boolean(p.isLiked),
          isSaved: Boolean(p.isSaved),
          type: p.type,
          videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
          coverImageUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
          mediaUrls: p.mediaUrls ?? [],
        }));
      setPosts((prev) => (pageState ? [...prev, ...list] : list));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, pageState]);

  const createPost = useCallback(
    async (
      caption: string,
      type: string = "TEXT",
      author?: { username?: string; avatar?: string },
      mediaUrls?: string[]
    ) => {
      if (!currentUserId) return;
      const data = await api.createPost(caption, type, mediaUrls);
      if (data?.postId) {
        const p = await api.getPost(data.postId);
        if (p) {
          const newPost: FeedPost = {
            id: p.postId,
            userId: p.userId,
            username: author?.username ?? p.username ?? p.userId?.slice(0, 8) ?? "",
            avatar: author?.avatar ?? p.avatar ?? "/placeholder.svg?height=32&width=32",
            timestamp: formatTime(p.createdAt),
            imageUrl: p.mediaUrls?.[0] ?? "/placeholder.svg?height=600&width=600",
            likeCount: String(p.likeCount ?? 0),
            commentCount: String(p.commentCount ?? 0),
            caption: p.caption ?? "",
            isLiked: Boolean(p.isLiked),
            isSaved: Boolean(p.isSaved),
            type: p.type,
            videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
            coverImageUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
            mediaUrls: p.mediaUrls ?? [],
          };
          setPosts((prev) => [newPost, ...prev]);
        }
      }
    },
    [currentUserId]
  );

  const loadSuggestions = useCallback(async () => {
    if (!currentUserId) return;
    setSuggestionsLoading(true);
    try {
      const list = await api.getSuggestions(10);
      setSuggestions(list.map(toSuggestedUser));
    } finally {
      setSuggestionsLoading(false);
    }
  }, [currentUserId]);

  const followUser = useCallback((userId: string) => api.followUser(userId), []);
  const unfollowUser = useCallback((userId: string) => api.unfollowUser(userId), []);

  const followSuggestion = useCallback(async (userId: string) => {
    await api.followUser(userId);
    setSuggestions((prev) => prev.filter((s) => s.id !== userId));
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const wasLiked = post?.isLiked ?? false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !wasLiked;
        const delta = nextLiked ? 1 : -1;
        return {
          ...p,
          isLiked: nextLiked,
          likeCount: String(Math.max(0, parseInt(p.likeCount, 10) + delta)),
        };
      })
    );
    try {
      if (wasLiked) await api.unlikePost(postId);
      else await api.likePost(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount } : p))
      );
    }
  }, [posts]);

  const toggleSave = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const wasSaved = post?.isSaved ?? false;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !wasSaved } : p))
    );
    try {
      if (wasSaved) await api.unsavePost(postId);
      else await api.savePost(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
      );
    }
  }, [posts]);

  return {
    posts,
    loading,
    error,
    loadFeed,
    createPost,
    suggestions,
    suggestionsLoading,
    loadSuggestions,
    followUser,
    followSuggestion,
    unfollowUser,
    toggleLike,
    toggleSave,
  };
}

function mapDetailToFeedPost(p: {
  postId: string;
  userId: string;
  username?: string;
  avatar?: string;
  createdAt: string;
  mediaUrls?: string[];
  likeCount?: number;
  commentCount?: number;
  caption?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  type?: string;
}): FeedPost {
  return {
    id: p.postId,
    userId: p.userId,
    username: p.username ?? p.userId?.slice(0, 8) ?? "",
    avatar: p.avatar ?? "/placeholder.svg?height=32&width=32",
    timestamp: formatTime(p.createdAt),
    imageUrl: p.mediaUrls?.[0] ?? "/placeholder.svg?height=600&width=600",
    likeCount: String(p.likeCount ?? 0),
    commentCount: String(p.commentCount ?? 0),
    caption: p.caption ?? "",
    isLiked: Boolean(p.isLiked),
    isSaved: Boolean(p.isSaved),
    type: p.type,
    videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
    coverImageUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
    mediaUrls: p.mediaUrls ?? [],
  };
}

export function useExplore(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExplore = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const { entries } = await api.getExplore(20, 0);
      const details = await Promise.all(
        entries.map((e: { postId: string }) => api.getPost(e.postId).catch(() => null))
      );
      const list = details.filter(Boolean).map((p: any) => mapDetailToFeedPost(p));
      setPosts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const toggleLike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const wasLiked = post?.isLiked ?? false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !wasLiked;
        const delta = nextLiked ? 1 : -1;
        return {
          ...p,
          isLiked: nextLiked,
          likeCount: String(Math.max(0, parseInt(p.likeCount, 10) + delta)),
        };
      })
    );
    try {
      if (wasLiked) await api.unlikePost(postId);
      else await api.likePost(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount } : p))
      );
    }
  }, [posts]);

  const toggleSave = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    const wasSaved = post?.isSaved ?? false;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !wasSaved } : p))
    );
    try {
      if (wasSaved) await api.unsavePost(postId);
      else await api.savePost(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
      );
    }
  }, [posts]);

  return {
    posts,
    loading,
    error,
    loadExplore,
    toggleLike,
    toggleSave,
  };
}

export type PostComment = {
  id: string;
  userId: string;
  username?: string;
  content: string;
  createdAt: string;
};

export function usePostComments(postId: string | null) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const list = await api.getComments(postId, 1, 50);
      setComments(
        list.map((c: { id: string; userId: string; content: string; createdAt: string }) => ({
          id: c.id,
          userId: c.userId,
          content: c.content,
          createdAt: c.createdAt,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const add = useCallback(
    async (content: string, author?: { userId: string; username?: string }) => {
      if (!postId) return;
      const data = await api.addComment(postId, content);
      if (data?.id) {
        setComments((prev) => [
          ...prev,
          {
            id: data.id,
            userId: author?.userId ?? "",
            username: author?.username,
            content,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    },
    [postId]
  );

  return { comments, loading, load, add };
}

export function useProfileStats(userId: string | undefined) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const stats = await api.getProfileStats(userId);
      setFollowersCount(stats.followersCount);
      setFollowingCount(stats.followingCount);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { followersCount, followingCount, loading, load };
}
