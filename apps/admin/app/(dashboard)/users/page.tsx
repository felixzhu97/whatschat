"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "@/src/shared/utils/emotion";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search, ChevronLeft } from "lucide-react";
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

const Table = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9edef;
  overflow: hidden;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px 100px;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  font-size: 0.9375rem;
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled(TableRow)`
  background: #f8f9fa;
  font-weight: 500;
  color: #54656f;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #075e54;
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
  color: #111;
`;

const UserEmail = styled.div`
  font-size: 0.8125rem;
  color: #8696a0;
`;

const LinkBtn = styled(Link)`
  color: #128c7e;
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

const PageBtn = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e9edef;
  background: ${(p) => (p.$active ? "#128c7e" : "#fff")};
  color: ${(p) => (p.$active ? "#fff" : "#54656f")};
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #f0f2f5;
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
                $active={p === pagination.page}
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
