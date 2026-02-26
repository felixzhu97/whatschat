"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "@/src/presentation/providers/auth-provider";

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25d366 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  &:focus {
    outline: none;
    border-color: #128c7e;
    box-shadow: 0 0 0 3px rgba(18, 140, 126, 0.2);
  }
`;

const Button = styled.button<{ $loading?: boolean }>`
  padding: 0.75rem 1rem;
  background: #128c7e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  opacity: ${(p) => (p.$loading ? 0.7 : 1)};
  &:hover:not(:disabled) {
    background: #0d6b5f;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
`;

const DEFAULT_EMAIL = "admin@whatschat.com";
const DEFAULT_PASSWORD = "123456";

export default function LoginPage() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err ? String((err as Error).message) : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Title>WhatsChat Admin</Title>
        <Subtitle>管理员登录</Subtitle>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button type="submit" disabled={loading} $loading={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </Form>
      </Card>
    </Page>
  );
}
