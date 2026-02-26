"use client";

import { useEffect, useState } from "react";
import { styled } from "@/src/shared/utils/emotion";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
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
  border: 1px solid #e9edef;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: #fff;
  &:focus {
    outline: none;
    border-color: #128c7e;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  & svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #8696a0;
    width: 18px;
  }
`;

const GroupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const GroupCard = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9edef;
  padding: 1.25rem;
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
  background: #075e54;
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
  color: #111;
  font-size: 1rem;
`;

const GroupMeta = styled.div`
  font-size: 0.8125rem;
  color: #8696a0;
  margin-top: 0.25rem;
`;

const Members = styled.div`
  font-size: 0.875rem;
  color: #54656f;
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
  const [groups, setGroups] = useState<Group[]>([]);
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
      <PageTitle>群组管理</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder="搜索群组名称"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchWrapper>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "#128c7e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            搜索
          </button>
        </Toolbar>
      </form>
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#8696a0" }}>
          加载中...
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
                      创建者: {g.creator?.username} ·{" "}
                      {format(new Date(g.createdAt), "yyyy-MM-dd", {
                        locale: zhCN,
                      })}
                    </GroupMeta>
                  </div>
                </GroupHeader>
                {g.description && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#54656f",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {g.description}
                  </div>
                )}
                <Members>
                  成员 {g.participants?.length || 0} 人
                  {g.participants?.slice(0, 5).map((p) => (
                    <span
                      key={p.username}
                      style={{
                        display: "inline-block",
                        marginLeft: "0.25rem",
                        padding: "0.125rem 0.375rem",
                        background: "#f0f2f5",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {p.username}
                    </span>
                  ))}
                  {(g.participants?.length || 0) > 5 && (
                    <span style={{ marginLeft: "0.25rem", color: "#8696a0" }}>
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
                  border: "1px solid #e9edef",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                上一页
              </button>
              <span style={{ padding: "0.5rem" }}>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #e9edef",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
