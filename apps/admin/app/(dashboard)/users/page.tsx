"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { DataGrid } from "@/src/presentation/components/data-grid";
import { Search, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import type { ColDef } from "ag-grid-community";

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

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

function UserCell(params: { value: string; data: User }) {
  const { data } = params;
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <div
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: "50%",
          background: theme.primary,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 500,
          fontSize: "0.875rem",
        }}
      >
        {(data?.username || "?").charAt(0).toUpperCase()}
      </div>
      <div style={{ lineHeight: 1.4, minHeight: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontWeight: 500, color: theme.text, fontSize: "15px" }}>{data?.username}</div>
        <div style={{ fontSize: "13px", color: theme.textSecondary }}>
          {data?.isOnline ? t("users.online") : t("users.offline")}
        </div>
      </div>
    </div>
  );
}

function ActionCell(params: { data: User }) {
  const { data } = params;
  const { t } = useTranslation();
  if (!data?.id) return null;
  return (
    <Link
      href={`/users/${data.id}`}
      style={{
        color: theme.primary,
        textDecoration: "none",
        fontSize: "15px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {t("users.detail")}
      <ChevronRight size={18} strokeWidth={2} />
    </Link>
  );
}

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const api = getApiClient();

  const load = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
      });
      api
        .get<User[]>(`admin/users?${params}`)
        .then((res) => {
          if (res.success) {
            const r = res as { data?: User[]; pagination?: typeof pagination };
            setUsers(r.data || []);
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

  const columnDefs = useMemo<ColDef<User>[]>(
    () => [
      {
        field: "username",
        headerName: t("users.userHeader"),
        flex: 1,
        minWidth: 220,
        cellClass: "user-cell",
        cellRenderer: UserCell,
      },
      {
        field: "email",
        headerName: t("users.email"),
        flex: 1,
        minWidth: 160,
      },
      {
        field: "phone",
        headerName: t("users.phone"),
        flex: 1,
        minWidth: 130,
        valueFormatter: (p) => p.value || "-",
      },
      {
        field: "createdAt",
        headerName: t("users.registeredAt"),
        minWidth: 130,
        valueFormatter: (p) =>
          p.value ? format(new Date(p.value as string), "yyyy-MM-dd", { locale: dateLocale }) : "",
      },
      {
        headerName: t("users.action"),
        minWidth: 90,
        sortable: false,
        filter: false,
        cellRenderer: ActionCell,
      },
    ],
    [t, dateLocale]
  );

  return (
    <div>
      <PageTitle>{t("users.title")}</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder={t("users.searchPlaceholder")}
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
            {t("users.search")}
          </button>
        </Toolbar>
      </form>
      <DataGrid<User>
        rowData={users}
        columnDefs={columnDefs}
        loading={loading}
        getRowId={(p) => p.data.id}
      />
      {pagination.totalPages > 1 && (
        <Pagination>
          <PageBtn disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>
            {t("common.prev")}
          </PageBtn>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
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
