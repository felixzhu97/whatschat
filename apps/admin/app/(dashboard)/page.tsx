"use client";

import { useEffect, useState } from "react";
import { styled } from "@/src/shared/utils/emotion";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { Users, MessageSquare, UsersRound, Activity } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9edef;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  background: #e7f5f3;
  color: #075e54;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
`;

const StatLabel = styled.div`
  font-size: 0.8125rem;
  color: #8696a0;
  margin-top: 0.25rem;
`;

const Section = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9edef;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 1rem;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f2f5;
  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #075e54;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #111;
`;

const UserMeta = styled.div`
  font-size: 0.8125rem;
  color: #8696a0;
`;

const OnlineBadge = styled.span<{ $online: boolean }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  background: ${(p) => (p.$online ? "#25d366" : "#e9edef")};
  color: ${(p) => (p.$online ? "#fff" : "#667781")};
`;

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalGroups: number;
  totalMessages: number;
  onlineUsers: number;
  todayMessages: number;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const api = getApiClient();

  useEffect(() => {
    api
      .get<Stats>("admin/stats")
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageTitle>仪表盘</PageTitle>
        <div>加载中...</div>
      </div>
    );
  }
  if (!stats) {
    return (
      <div>
        <PageTitle>仪表盘</PageTitle>
        <div style={{ color: "#dc3545" }}>加载失败，请确认有管理员权限</div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>仪表盘</PageTitle>
      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Users size={22} />
          </StatIcon>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>总用户数</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>
            <Activity size={22} />
          </StatIcon>
          <StatValue>{stats.onlineUsers}</StatValue>
          <StatLabel>在线用户</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>
            <MessageSquare size={22} />
          </StatIcon>
          <StatValue>{stats.totalChats}</StatValue>
          <StatLabel>聊天数</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>
            <UsersRound size={22} />
          </StatIcon>
          <StatValue>{stats.totalGroups}</StatValue>
          <StatLabel>群组数</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>
            <MessageSquare size={22} />
          </StatIcon>
          <StatValue>{stats.totalMessages}</StatValue>
          <StatLabel>总消息数</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon>
            <Activity size={22} />
          </StatIcon>
          <StatValue>{stats.todayMessages}</StatValue>
          <StatLabel>今日消息</StatLabel>
        </StatCard>
      </StatsGrid>
      <Section>
        <SectionTitle>最近注册用户</SectionTitle>
        {stats.recentUsers?.length ? (
          stats.recentUsers.map((u) => (
            <UserRow key={u.id}>
              <Avatar>
                {u.username?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
              <UserInfo>
                <UserName>{u.username}</UserName>
                <UserMeta>
                  {u.email} ·{" "}
                  {format(new Date(u.createdAt), "PP", { locale: zhCN })}
                </UserMeta>
              </UserInfo>
              <OnlineBadge $online={u.isOnline}>
                {u.isOnline ? "在线" : "离线"}
              </OnlineBadge>
            </UserRow>
          ))
        ) : (
          <div style={{ color: "#8696a0", fontSize: "0.875rem" }}>
            暂无用户
          </div>
        )}
      </Section>
    </div>
  );
}
