"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.text};
  margin-bottom: 1.5rem;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font-size: 0.9375rem;
  color: ${theme.text};
  &:focus {
    outline: none;
    border-color: ${theme.primary};
  }
  &::placeholder {
    color: ${theme.textSecondary};
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  & svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.iconMuted};
    width: 18px;
  }
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const GroupCard = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  border: 1px solid ${theme.border};
  padding: 1.25rem;
  box-shadow: ${theme.shadow};
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const GroupName = styled.div`
  font-weight: 600;
  color: ${theme.text};
  font-size: 1rem;
`;

const GroupMeta = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  margin-top: 0.25rem;
`;

const Members = styled.div`
  font-size: 0.875rem;
  color: ${theme.textSecondary};
  margin-top: 0.5rem;
`;

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  creator: { id: string; username: string; email: string };
  participants: Array<{ username: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function GroupsPage() {
  const { t, i18n } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const dateLocale = i18n.language.startsWith("zh") ? zhCN : enUS;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const api = getApiClient();

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: "20",
      ...(search && { search }),
    });
    api
      .get<{ data: Group[]; pagination: { totalPages: number } }>(
        `admin/groups?${params}`
      )
      .then((res) => {
        if (res.success) {
          const r = res as { data?: Group[]; pagination?: { totalPages: number } };
          setGroups(r.data || []);
          setTotalPages(r.pagination?.totalPages || 1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div>
      <PageTitle>{t("groups.title")}</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder={t("groups.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchWrapper>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: theme.primary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {t("groups.search")}
          </button>
        </Toolbar>
      </form>
      {loading ? (
<div style={{ padding: "2rem", textAlign: "center", color: theme.textSecondary }}>
        {t("common.loading")}
      </div>
      ) : (
        <>
          <GroupGrid>
            {groups.map((g) => (
              <GroupCard key={g.id}>
                <GroupHeader>
                  <Avatar>{g.name?.charAt(0)?.toUpperCase() || "?"}</Avatar>
                  <div>
                    <GroupName>{g.name}</GroupName>
                    <GroupMeta>
                      {t("groups.creator")}: {g.creator?.username} ·{" "}
                      {format(new Date(g.createdAt), "yyyy-MM-dd", {
                        locale: dateLocale,
                      })}
                    </GroupMeta>
                  </div>
                </GroupHeader>
                {g.description && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: theme.textSecondary,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {g.description}
                  </div>
                )}
                <Members>
                  {t("groups.membersCount", { count: g.participants?.length || 0 })}
                  {g.participants?.slice(0, 5).map((p) => (
                    <span
                      key={p.username}
                      style={{
                        display: "inline-block",
                        marginLeft: "0.25rem",
                        padding: "0.125rem 0.375rem",
                        background: theme.surfaceAlt,
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {p.username}
                    </span>
                  ))}
                  {(g.participants?.length || 0) > 5 && (
                    <span style={{ marginLeft: "0.25rem", color: theme.textSecondary }}>
                      +{g.participants!.length - 5}
                    </span>
                  )}
                </Members>
              </GroupCard>
            ))}
          </GroupGrid>
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
style={{
                padding: "0.5rem 0.75rem",
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                borderRadius: "6px",
                cursor: "pointer",
              }}
              >
                {t("common.prev")}
              </button>
              <span style={{ padding: "0.5rem", color: theme.textSecondary }}>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
style={{
                padding: "0.5rem 0.75rem",
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                borderRadius: "6px",
                cursor: "pointer",
              }}
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
