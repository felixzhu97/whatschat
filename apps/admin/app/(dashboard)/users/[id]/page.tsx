"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { styled } from "@/src/shared/utils/emotion";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #128c7e;
  text-decoration: none;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  &:hover {
    text-decoration: underline;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e9edef;
  padding: 1.5rem;
  max-width: 500px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #075e54;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const UserName = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.5rem;
`;

const Row = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #8696a0;
`;

const Actions = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
`;

const Btn = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$danger ? "#dc3545" : "#e9edef")};
  background: ${(p) => (p.$danger ? "#dc3545" : "#fff")};
  color: ${(p) => (p.$danger ? "#fff" : "#54656f")};
  &:hover {
    opacity: 0.9;
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const api = getApiClient();

  useEffect(() => {
    if (!params.id) return;
    api
      .get<User>(`admin/users/${params.id}`)
      .then((res) => {
        if (res.success && res.data) setUser(res.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = () => {
    if (!user || !confirm("确定删除该用户？此操作不可恢复。")) return;
    setDeleting(true);
    api
      .delete(`admin/users/${user.id}`)
      .then(() => {
        router.push("/users");
      })
      .finally(() => setDeleting(false));
  };

  if (loading || !user) {
    return (
      <div>
        <BackLink href="/users">
          <ArrowLeft size={18} /> 返回用户列表
        </BackLink>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <BackLink href="/users">
        <ArrowLeft size={18} /> 返回用户列表
      </BackLink>
      <Card>
        <Avatar>{user.username?.charAt(0)?.toUpperCase() || "?"}</Avatar>
        <UserName>{user.username}</UserName>
        <Row>
          <Label>邮箱</Label>
          <span>{user.email}</span>
        </Row>
        <Row>
          <Label>手机</Label>
          <span>{user.phone || "-"}</span>
        </Row>
        <Row>
          <Label>状态</Label>
          <span>{user.isOnline ? "在线" : "离线"}</span>
        </Row>
        <Row>
          <Label>注册时间</Label>
          <span>{format(new Date(user.createdAt), "PPpp", { locale: zhCN })}</span>
        </Row>
        <Row>
          <Label>最后登录</Label>
          <span>{format(new Date(user.lastSeen), "PPpp", { locale: zhCN })}</span>
        </Row>
        <Actions>
          <Btn $danger onClick={handleDelete} disabled={deleting}>
            {deleting ? "删除中..." : "删除用户"}
          </Btn>
        </Actions>
      </Card>
    </div>
  );
}
