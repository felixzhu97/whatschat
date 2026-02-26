"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

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

const Table = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  border: 1px solid ${theme.border};
  overflow: hidden;
  box-shadow: ${theme.shadow};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px 100px;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${theme.border};
  align-items: center;
  font-size: 0.9375rem;
  color: ${theme.text};
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled(TableRow)`
  background: ${theme.surfaceAlt};
  font-weight: 500;
  color: ${theme.textSecondary};
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.875rem;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${theme.text};
`;

const UserEmail = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
`;

const LinkBtn = styled(Link)`
  color: ${theme.primary};
  text-decoration: none;
  font-size: 0.875rem;
  &:hover {
    text-decoration: underline;
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
  padding: 0.5rem 0.75rem;
  border: 1px solid ${theme.border};
  background: ${(p) => (p.active ? theme.primary : theme.surface)};
  color: ${(p) => (p.active ? "#fff" : theme.text)};
  border-radius: 6px;
  font-size: 0.875rem;
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

export default function UsersPage() {
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

  const load = (page = 1) => {
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
  };

  useEffect(() => {
    load(pagination.page);
  }, [pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div>
      <PageTitle>用户管理</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder="搜索用户名/邮箱/手机"
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
            搜索
          </button>
        </Toolbar>
      </form>
      <Table>
        <TableHeader>
          <div>用户</div>
          <div>邮箱</div>
          <div>手机</div>
          <div>注册时间</div>
          <div>操作</div>
        </TableHeader>
        {loading ? (
          <TableRow>
            <div colSpan={5} style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
              加载中...
            </div>
          </TableRow>
        ) : (
          users.map((u) => (
            <TableRow key={u.id}>
              <div>
                <UserCell>
                  <Avatar>{u.username?.charAt(0)?.toUpperCase() || "?"}</Avatar>
                  <div>
                    <UserName>{u.username}</UserName>
                    <UserEmail>{u.isOnline ? "在线" : "离线"}</UserEmail>
                  </div>
                </UserCell>
              </div>
              <div>{u.email}</div>
              <div>{u.phone || "-"}</div>
              <div>
                {format(new Date(u.createdAt), "yyyy-MM-dd", { locale: zhCN })}
              </div>
              <div>
                <LinkBtn href={`/users/${u.id}`}>
                  <ChevronLeft size={16} style={{ display: "inline", verticalAlign: "middle" }} />
                  详情
                </LinkBtn>
              </div>
            </TableRow>
          ))
        )}
      </Table>
      {pagination.totalPages > 1 && (
        <Pagination>
          <PageBtn
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
          >
            上一页
          </PageBtn>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <PageBtn
                key={p}
                active={p === pagination.page}
                onClick={() => load(p)}
              >
                {p}
              </PageBtn>
            )
          )}
          <PageBtn
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1)}
          >
            下一页
          </PageBtn>
        </Pagination>
      )}
    </div>
  );
}
