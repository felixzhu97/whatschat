"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
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

  const loadHashtagSuggestions = useCallback(
    async (q: string) => {
      const t = q.replace(/^#/, "").trim().toLowerCase();
      if (!t) {
        setHashtagSuggestions([]);
        return;
      }
      try {
        const res = await api.search(t, "hashtags", 5);
        setHashtagSuggestions(res.hits);
      } catch {
        setHashtagSuggestions([]);
      }
    },
    []
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((nextQuery: string, nextType: SearchType) => {
        void runSearch(nextQuery, nextType);
      }, DEBOUNCE_MS),
    [runSearch]
  );

  const debouncedSuggestions = useMemo(
    () =>
      debounce((nextQuery: string) => {
        void loadHashtagSuggestions(nextQuery);
      }, 200),
    [loadHashtagSuggestions]
  );

  useEffect(() => {
    if (!query.trim()) {
      debouncedSearch.cancel();
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
    debouncedSearch(query, searchType);
    return () => debouncedSearch.cancel();
  }, [query, searchType, debouncedSearch]);

  useEffect(() => {
    if (searchType === "all" || searchType === "hashtags") {
      debouncedSuggestions.cancel();
      return;
    }
    debouncedSuggestions(query);
    return () => debouncedSuggestions.cancel();
  }, [query, searchType, debouncedSuggestions]);

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
