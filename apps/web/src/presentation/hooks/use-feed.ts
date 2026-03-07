"use client";

import { useState, useCallback } from "react";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";
import type { FeedPost } from "@/shared/types";

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

export function useFeed(currentUserId: string | undefined) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

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
          likeCount: "0",
          commentCount: "0",
          caption: p.caption ?? "",
          isLiked: false,
          isSaved: false,
          type: p.type,
          videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
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
            likeCount: "0",
            commentCount: "0",
            caption: p.caption ?? "",
            isLiked: false,
            isSaved: false,
            type: p.type,
            videoUrl: p.type === "VIDEO" ? p.mediaUrls?.[0] : undefined,
          };
          setPosts((prev) => [newPost, ...prev]);
        }
      }
    },
    [currentUserId]
  );

  const followUser = useCallback((userId: string) => api.followUser(userId), []);
  const unfollowUser = useCallback((userId: string) => api.unfollowUser(userId), []);

  return {
    posts,
    loading,
    error,
    loadFeed,
    createPost,
    followUser,
    unfollowUser,
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
