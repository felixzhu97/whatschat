"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { DataGrid } from "@/src/presentation/components/data-grid";
import { Search, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import type { ColDef, ValueFormatterParams, ValueGetterParams } from "ag-grid-community";

const PageTitle = styled.h1`
  font-size: 1.375rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 360px;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  background: ${theme.inputBg};
  border: none;
  border-radius: 24px;
  font-size: 15px;
  color: ${theme.text};
  &:focus {
    outline: none;
    background: ${theme.surface};
    box-shadow: 0 0 0 1px ${theme.border};
  }
  &::placeholder {
    color: ${theme.textSecondary};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  & svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.iconMuted};
    width: 18px;
  }
`;

const BatchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: ${theme.surface};
  border: 1px solid ${theme.border};
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PageBtn = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>`
  padding: 0.5rem 0.875rem;
  border: 1px solid ${theme.border};
  background: ${(p) => (p.active ? theme.primary : theme.surface)};
  color: ${(p) => (p.active ? "#fff" : theme.text)};
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? theme.primary : theme.surfaceAlt)};
  }
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DetailPanel = styled.div`
  background: ${theme.surface};
  border-radius: 16px;
  max-width: 480px;
  width: 90%;
  max-height: 85vh;
  overflow: auto;
  box-shadow: ${theme.shadow};
  padding: 1.5rem;
`;

const DetailRow = styled.div`
  margin-bottom: 1rem;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  display: block;
  font-size: 12px;
  color: ${theme.textSecondary};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 15px;
  color: ${theme.text};
  word-break: break-word;
`;

const TRUNCATE_LEN = 60;

interface PostRow extends Record<string, unknown> {
  postId: string;
  userId: string;
  caption?: string;
  hashtags?: string[];
  autoTags?: string[];
  mediaUrls?: string[];
  createdAt: string;
  moderationStatus?: string;
  moderationCategories?: string[];
  moderationAt?: string | null;
  hidden?: boolean;
}

export default function PostsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [rows, setRows] = useState<PostRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const api = getApiClient();

  const toggleSelect = useCallback((postId: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);
  const selectAllCurrentPage = useCallback(() => {
    setSelectedPostIds(new Set(rows.map((r) => r.postId)));
  }, [rows]);
  const clearSelection = useCallback(() => setSelectedPostIds(new Set()), []);

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
      });
      api
        .get<PostRow[]>(`admin/list/posts?${params}`)
        .then((res) => {
          if (res.success) {
            const r = res as { data?: PostRow[]; pagination?: typeof pagination };
            setRows(r.data || []);
            if (r.pagination) setPagination(r.pagination);
          }
        })
        .finally(() => setLoading(false));
    },
    [api, search]
  );

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const handleHide = useCallback(
    async (postId: string) => {
      if (!confirm(t("posts.hidePostConfirm"))) return;
      setActionError(null);
      setActionLoading(true);
      try {
        await api.put(`admin/posts/${postId}/hide`);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: true } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId, t]
  );

  const handleUnhide = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        await api.put(`admin/posts/${postId}/unhide`);
        setRows((prev) => prev.map((r) => (r.postId === postId ? { ...r, hidden: false } : r)));
        if (selectedPost?.postId === postId) setSelectedPost((p) => (p ? { ...p, hidden: false } : null));
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!confirm(t("posts.deletePostConfirm"))) return;
      setActionError(null);
      setActionLoading(true);
      try {
        await api.delete(`admin/posts/${postId}`);
        setRows((prev) => prev.filter((r) => r.postId !== postId));
        if (selectedPost?.postId === postId) setSelectedPost(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId, t]
  );

  const handleRecheckModeration = useCallback(
    async (postId: string) => {
      setActionError(null);
      setActionLoading(true);
      try {
        const res = await api.post<{ moderationStatus: string; moderationCategories: string[]; moderationAt: string }>(
          `admin/posts/${postId}/recheck-moderation`
        );
        const data = (res as { data?: { moderationStatus: string; moderationCategories: string[]; moderationAt: string } }).data;
        if (data && selectedPost?.postId === postId) {
          setSelectedPost((p) => (p ? { ...p, ...data } : null));
          setRows((prev) =>
            prev.map((r) => (r.postId === postId ? { ...r, ...data } : r))
          );
        }
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e));
      } finally {
        setActionLoading(false);
      }
    },
    [api, selectedPost?.postId]
  );

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchDeleteConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await api.post<{ deleted: number; failed: string[] }>("admin/posts/batch-delete", { postIds: ids });
      const data = (res as { data?: { deleted: number; failed: string[] } }).data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) => prev.filter((r) => !ids.includes(r.postId) || failedSet.has(r.postId)));
        setSelectedPostIds((prev) => new Set([...prev].filter((id) => failedSet.has(id))));
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost(null);
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [api, selectedPostIds, selectedPost, t]);

  const handleBatchHide = useCallback(async () => {
    const ids = Array.from(selectedPostIds);
    if (!ids.length || !confirm(t("posts.batchHideConfirm", { count: ids.length }))) return;
    setActionError(null);
    setBatchLoading(true);
    try {
      const res = await api.post<{ hidden: number; failed: string[] }>("admin/posts/batch-hide", { postIds: ids });
      const data = (res as { data?: { hidden: number; failed: string[] } }).data;
      if (data) {
        const failedSet = new Set(data.failed || []);
        setRows((prev) =>
          prev.map((r) => (ids.includes(r.postId) && !failedSet.has(r.postId) ? { ...r, hidden: true } : r))
        );
        if (selectedPost && ids.includes(selectedPost.postId) && !failedSet.has(selectedPost.postId))
          setSelectedPost((p) => (p ? { ...p, hidden: true } : null));
        setSelectedPostIds(new Set());
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  }, [api, selectedPostIds, selectedPost, t]);

  const isValidImageUrl = (s: string) =>
    typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:"));

  const columnDefs = useMemo<ColDef<PostRow>[]>(
    () => [
      {
        colId: "select",
        width: 44,
        maxWidth: 44,
        suppressSort: true,
        cellRenderer: (p: { data: PostRow }) => (
          <input
            type="checkbox"
            checked={selectedPostIds.has(p.data.postId)}
            onChange={() => toggleSelect(p.data.postId)}
            onClick={(e) => e.stopPropagation()}
            aria-label={t("common.select")}
          />
        ),
      },
      {
        field: "mediaUrls",
        headerName: t("posts.thumbnail"),
        width: 80,
        maxWidth: 80,
        cellRenderer: (p: { value: string[]; data: PostRow }) => {
          const url = Array.isArray(p.value) ? p.value[0] : null;
          if (!url || !isValidImageUrl(url)) {
            return (
              <span
                style={{
                  display: "inline-flex",
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.inputBg,
                  borderRadius: 8,
                  color: theme.textSecondary,
                }}
                title={url === "[inline]" ? "Inline image" : undefined}
              >
                <ImageIcon size={24} />
              </span>
            );
          }
          return (
            <span style={{ position: "relative", display: "inline-block", width: 48, height: 48 }}>
              <img
                src={url}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  const fallback = el.parentElement?.querySelector(".thumb-fallback");
                  if (fallback) (fallback as HTMLElement).style.display = "inline-flex";
                }}
              />
              <span
                className="thumb-fallback"
                style={{
                  display: "none",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.inputBg,
                  borderRadius: 8,
                  color: theme.textSecondary,
                }}
              >
                <ImageIcon size={24} />
              </span>
            </span>
          );
        },
      },
      {
        field: "userId",
        headerName: t("posts.author"),
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => p.value ?? "—",
      },
      {
        field: "caption",
        headerName: t("posts.caption"),
        flex: 1,
        minWidth: 180,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => {
          const s = p.value ? String(p.value) : "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ValueGetterParams<PostRow>) => (p.value ? String(p.value) : undefined),
      },
      {
        field: "hashtags",
        headerName: t("posts.hashtags"),
        minWidth: 140,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => {
          const arr = Array.isArray(p.value) ? (p.value as string[]) : [];
          const s = arr.join(", ") || "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ValueGetterParams<PostRow>) =>
          Array.isArray(p.value) ? (p.value as string[]).join(", ") || undefined : undefined,
      },
      {
        field: "autoTags",
        headerName: t("posts.autoTags"),
        minWidth: 160,
        valueFormatter: (p: ValueFormatterParams<PostRow>) => {
          const arr = Array.isArray(p.value) ? (p.value as string[]) : [];
          const s = arr.join(", ") || "";
          return s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + "…" : s || "—";
        },
        tooltipValueGetter: (p: ValueGetterParams<PostRow>) =>
          Array.isArray(p.value) ? (p.value as string[]).join(", ") || undefined : undefined,
      },
      {
        field: "createdAt",
        headerName: t("posts.createdAt"),
        minWidth: 130,
        valueFormatter: (p: ValueFormatterParams<PostRow>) =>
          p.value ? format(new Date(p.value as string), "yyyy-MM-dd HH:mm", { locale: dateLocale }) : "—",
      },
      {
        field: "moderationStatus",
        headerName: t("posts.contentSafety"),
        minWidth: 100,
        cellRenderer: (p: { value: string; data: PostRow }) => {
          const s = p.value || "pending";
          const label =
            s === "reject"
              ? t("posts.moderationReject")
              : s === "pass"
                ? t("posts.moderationPass")
                : t("posts.moderationPending");
          const bg =
            s === "reject"
              ? "rgba(239, 68, 68, 0.15)"
              : s === "pass"
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(156, 163, 175, 0.2)";
          const color =
            s === "reject"
              ? "#dc2626"
              : s === "pass"
                ? "#16a34a"
                : theme.textSecondary;
          return (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  background: bg,
                  color,
                }}
              >
                {label}
              </span>
              {p.data.hidden && (
                <span
                  style={{
                    padding: "0.2rem 0.4rem",
                    borderRadius: 6,
                    fontSize: 11,
                    background: "rgba(0,0,0,0.08)",
                    color: theme.textSecondary,
                  }}
                >
                  {t("posts.hidden")}
                </span>
              )}
            </span>
          );
        },
      },
    ],
    [t, dateLocale, selectedPostIds, toggleSelect]
  );

  return (
    <div>
      <PageTitle>{t("posts.title")}</PageTitle>
      {selectedPostIds.size > 0 && (
        <BatchBar>
          <span style={{ fontSize: 14, color: theme.text }}>
            {t("posts.selectedCount", { count: selectedPostIds.size })}
          </span>
          <button
            type="button"
            onClick={clearSelection}
            style={{
              padding: "0.35rem 0.75rem",
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              color: theme.textSecondary,
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={batchLoading}
            onClick={handleBatchHide}
            style={{
              padding: "0.35rem 0.75rem",
              border: "none",
              background: theme.primary,
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              cursor: batchLoading ? "not-allowed" : "pointer",
            }}
          >
            {t("posts.batchHide")}
          </button>
          <button
            type="button"
            disabled={batchLoading}
            onClick={handleBatchDelete}
            style={{
              padding: "0.35rem 0.75rem",
              border: "1px solid #dc2626",
              background: "transparent",
              color: "#dc2626",
              borderRadius: 8,
              fontSize: 13,
              cursor: batchLoading ? "not-allowed" : "pointer",
            }}
          >
            {t("posts.batchDelete")}
          </button>
        </BatchBar>
      )}
      <form onSubmit={handleSearch}>
        <Toolbar>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={() =>
                selectedPostIds.size === rows.length ? clearSelection() : selectAllCurrentPage()
              }
              style={{
                padding: "0.35rem 0.75rem",
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
                color: theme.text,
              }}
            >
              {selectedPostIds.size === rows.length ? t("posts.clearSelection") : t("posts.selectAllPage")}
            </button>
          )}
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder={t("posts.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchWrapper>
          <button
            type="submit"
            style={{
              padding: "0.625rem 1.25rem",
              background: theme.primary,
              color: "#fff",
              border: "none",
              borderRadius: 24,
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {t("posts.search")}
          </button>
        </Toolbar>
      </form>
      <DataGrid<PostRow>
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        getRowId={(p) => p.data.postId}
        onRowClicked={({ data }) => setSelectedPost(data)}
      />
      {selectedPost && (
        <DetailOverlay
          onClick={() => setSelectedPost(null)}
          role="presentation"
        >
          <DetailPanel onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>{t("posts.detail")}</h3>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                  color: theme.textSecondary,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {Array.isArray(selectedPost.mediaUrls) && selectedPost.mediaUrls[0] && isValidImageUrl(selectedPost.mediaUrls[0]) && (
              <DetailRow>
                <DetailLabel>{t("posts.thumbnail")}</DetailLabel>
                <img
                  src={selectedPost.mediaUrls[0]}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 12 }}
                />
              </DetailRow>
            )}
            <DetailRow>
              <DetailLabel>{t("posts.author")}</DetailLabel>
              <DetailValue>{selectedPost.userId}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.caption")}</DetailLabel>
              <DetailValue>{selectedPost.caption || "—"}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.hashtags")}</DetailLabel>
              <DetailValue>
                {Array.isArray(selectedPost.hashtags) && selectedPost.hashtags.length > 0
                  ? selectedPost.hashtags.join(", ")
                  : "—"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.createdAt")}</DetailLabel>
              <DetailValue>
                {selectedPost.createdAt
                  ? format(new Date(selectedPost.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: dateLocale })
                  : "—"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>{t("posts.violationRecognition")}</DetailLabel>
              <DetailValue style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span>
                  {t("posts.autoTags")}:{" "}
                  {Array.isArray(selectedPost.autoTags) && selectedPost.autoTags.length > 0
                    ? selectedPost.autoTags.join(", ")
                    : "—"}
                </span>
                <span>
                  {t("posts.moderationStatus")}:{" "}
                  {selectedPost.moderationStatus === "reject"
                    ? t("posts.moderationReject")
                    : selectedPost.moderationStatus === "pass"
                      ? t("posts.moderationPass")
                      : t("posts.moderationPending")}
                </span>
                {Array.isArray(selectedPost.moderationCategories) && selectedPost.moderationCategories.length > 0 && (
                  <span>
                    {t("posts.moderationCategories")}: {selectedPost.moderationCategories.join(", ")}
                  </span>
                )}
                {selectedPost.moderationAt && (
                  <span>
                    {t("posts.moderationAt")}: {format(new Date(selectedPost.moderationAt), "yyyy-MM-dd HH:mm:ss", { locale: dateLocale })}
                  </span>
                )}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleRecheckModeration(selectedPost.postId)}
                  style={{
                    alignSelf: "flex-start",
                    marginTop: 4,
                    padding: "0.4rem 0.75rem",
                    fontSize: 13,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    background: theme.surface,
                    color: theme.text,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {t("posts.recheckModeration")}
                </button>
              </DetailValue>
            </DetailRow>
            {selectedPost.hidden && (
              <DetailRow>
                <DetailValue style={{ color: theme.textSecondary, fontSize: 13 }}>{t("posts.hidden")}</DetailValue>
              </DetailRow>
            )}
            {actionError && (
              <DetailRow>
                <DetailValue style={{ color: "#dc2626", fontSize: 13 }}>{actionError}</DetailValue>
              </DetailRow>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${theme.border}` }}>
              {selectedPost.hidden ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUnhide(selectedPost.postId)}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: 14,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    background: theme.surface,
                    color: theme.text,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {t("posts.unhidePost")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleHide(selectedPost.postId)}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: 14,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    background: theme.surface,
                    color: theme.text,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {t("posts.hidePost")}
                </button>
              )}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDelete(selectedPost.postId)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: 14,
                  border: "1px solid #dc2626",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#dc2626",
                  cursor: actionLoading ? "not-allowed" : "pointer",
                }}
              >
                {t("posts.deletePost")}
              </button>
            </div>
          </DetailPanel>
        </DetailOverlay>
      )}
      {pagination.totalPages > 1 && (
        <Pagination>
          <PageBtn disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>
            {t("common.prev")}
          </PageBtn>
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <PageBtn key={p} active={p === pagination.page} onClick={() => load(p)}>
              {p}
            </PageBtn>
          ))}
          <PageBtn
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1)}
          >
            {t("common.next")}
          </PageBtn>
        </Pagination>
      )}
    </div>
  );
}
