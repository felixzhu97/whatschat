"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Search, ChevronRight } from "lucide-react";
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

const ChatList = styled.div`
  background: ${theme.surface};
  border-radius: 12px;
  border: 1px solid ${theme.border};
  overflow: hidden;
  box-shadow: ${theme.shadow};
`;

const ChatItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${theme.border};
  text-decoration: none;
  color: ${theme.text};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${theme.surfaceAlt};
  }
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

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 500;
  color: ${theme.text};
  margin-bottom: 0.25rem;
`;

const ChatMeta = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChatTime = styled.div`
  font-size: 0.8125rem;
  color: ${theme.textSecondary};
  flex-shrink: 0;
`;

interface Chat {
  id: string;
  type: string;
  name: string;
  avatar?: string;
  participants: Array<{ username: string; avatar?: string }>;
  lastMessage?: { content: string; sender?: { username: string } };
  updatedAt: string;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
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
      .get<{ data: Chat[]; pagination: { totalPages: number } }>(
        `admin/chats?${params}`
      )
      .then((res) => {
        if (res.success) {
          const r = res as { data?: Chat[]; pagination?: { totalPages: number } };
          setChats(r.data || []);
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

  const displayName = (c: Chat) =>
    c.name ||
    c.participants?.map((p) => p.username).join(", ") ||
    "未知聊天";

  return (
    <div>
      <PageTitle>聊天管理</PageTitle>
      <form onSubmit={handleSearch}>
        <Toolbar>
          <SearchWrapper>
            <Search size={18} />
            <SearchInput
              placeholder="搜索聊天"
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
      <ChatList>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: theme.textSecondary }}>
            加载中...
          </div>
        ) : (
          chats.map((c) => (
            <ChatItem key={c.id} href={`/chats/${c.id}`}>
              <Avatar>
                {displayName(c).charAt(0)?.toUpperCase() || "?"}
              </Avatar>
              <ChatInfo>
                <ChatName>{displayName(c)}</ChatName>
                <ChatMeta>
                  {c.lastMessage
                    ? `${c.lastMessage.sender?.username || ""}: ${c.lastMessage.content?.slice(0, 50) || ""}`
                    : "暂无消息"}
                </ChatMeta>
              </ChatInfo>
              <ChatTime>
                {format(new Date(c.updatedAt), "MM-dd HH:mm", { locale: zhCN })}
              </ChatTime>
              <ChevronRight size={20} color={theme.iconMuted} />
            </ChatItem>
          ))
        )}
      </ChatList>
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1rem",
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
            上一页
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
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
