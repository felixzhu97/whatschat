"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FeedApiAdapter } from "@/infrastructure/adapters/api/feed-api.adapter";
import { getApiClient } from "@/infrastructure/adapters/api/api-client.adapter";

const api = new FeedApiAdapter(getApiClient());
const LIMIT = 20;
const DEBOUNCE_MS = 350;

export type SearchType = "all" | "posts" | "users" | "hashtags";

export interface SearchHit {
  type: "user" | "post" | "hashtag";
  id: string;
  data: Record<string, unknown>;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [userHits, setUserHits] = useState<unknown[]>([]);
  const [postHits, setPostHits] = useState<unknown[]>([]);
  const [hashtagHits, setHashtagHits] = useState<unknown[]>([]);
  const [userNextCursor, setUserNextCursor] = useState<string | undefined>();
  const [postNextCursor, setPostNextCursor] = useState<string | undefined>();
  const [hashtagNextCursor, setHashtagNextCursor] = useState<string | undefined>();
  const [postTotal, setPostTotal] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<unknown[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string, type: SearchType, cursor?: string, append?: boolean) => {
      const trimmed = q.trim();
      if (!trimmed && type !== "all") return;
      const isLoadMore = !!cursor;
      if (type === "all") {
        if (isLoadMore) return;
        setLoading(true);
        setError(null);
        try {
          const [u, p, h] = await Promise.all([
            api.search(trimmed, "users", 10),
            api.search(trimmed, "posts", LIMIT),
            api.search(trimmed, "hashtags", 10),
          ]);
          setUserHits(u.hits);
          setUserNextCursor(u.nextCursor);
          setPostHits(p.hits);
          setPostNextCursor(p.nextCursor);
          setPostTotal(p.total);
          setHashtagHits(h.hits);
          setHashtagNextCursor(h.nextCursor);
          setHashtagSuggestions((h.hits as unknown[]).slice(0, 5));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Search failed");
        } finally {
          setLoading(false);
        }
        return;
      }
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const typeKey = type === "users" ? "users" : type === "posts" ? "posts" : "hashtags";
        const res = await api.search(trimmed, typeKey, LIMIT, cursor);
        if (type === "users") {
          if (append) setUserHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setUserHits(res.hits as unknown[]);
          setUserNextCursor(res.nextCursor);
        } else if (type === "posts") {
          if (append) setPostHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setPostHits(res.hits as unknown[]);
          setPostNextCursor(res.nextCursor);
          setPostTotal(res.total);
        } else {
          if (append) setHashtagHits((prev) => [...prev, ...(res.hits as unknown[])]);
          else setHashtagHits(res.hits as unknown[]);
          setHashtagNextCursor(res.nextCursor);
          setHashtagSuggestions((res.hits as unknown[]).slice(0, 5));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const loadHashtagSuggestions = useCallback((q: string) => {
    const t = q.replace(/^#/, "").trim().toLowerCase();
    if (!t) {
      setHashtagSuggestions([]);
      return;
    }
    if (suggestRef.current) clearTimeout(suggestRef.current);
    suggestRef.current = setTimeout(async () => {
      try {
        const res = await api.search(t, "hashtags", 5);
        setHashtagSuggestions(res.hits);
      } catch {
        setHashtagSuggestions([]);
      }
      suggestRef.current = null;
    }, 200);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setUserHits([]);
      setPostHits([]);
      setHashtagHits([]);
      setUserNextCursor(undefined);
      setPostNextCursor(undefined);
      setHashtagNextCursor(undefined);
      setPostTotal(undefined);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query, searchType);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchType, runSearch]);

  useEffect(() => {
    if (searchType === "all" || searchType === "hashtags") {
      return;
    }
    loadHashtagSuggestions(query);
    return () => {
      if (suggestRef.current) clearTimeout(suggestRef.current);
    };
  }, [query, searchType, loadHashtagSuggestions]);

  const loadMore = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || searchType === "all") return;
    if (searchType === "users" && userNextCursor) {
      runSearch(trimmed, "users", userNextCursor, true);
    } else if (searchType === "posts" && postNextCursor) {
      runSearch(trimmed, "posts", postNextCursor, true);
    } else if (searchType === "hashtags" && hashtagNextCursor) {
      runSearch(trimmed, "hashtags", hashtagNextCursor, true);
    }
  }, [query, searchType, userNextCursor, postNextCursor, hashtagNextCursor, runSearch]);

  const nextCursor =
    searchType === "users"
      ? userNextCursor
      : searchType === "posts"
        ? postNextCursor
        : searchType === "hashtags"
          ? hashtagNextCursor
          : undefined;

  return {
    query,
    setQuery,
    searchType,
    setSearchType,
    userHits,
    postHits,
    hashtagHits,
    postTotal,
    loading,
    loadingMore,
    error,
    nextCursor,
    loadMore,
    hashtagSuggestions,
    runSearch,
  };
}
