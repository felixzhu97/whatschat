"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { Label } from "@/src/presentation/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/presentation/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/src/presentation/components/ui/alert";
import { useAuth } from "../../src/presentation/hooks/use-auth";
import { styled } from "@/src/shared/utils/emotion";

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 28rem;
`;

const AuthPageShell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: rgb(249 250 251);
`;

const LogoCircle = styled.div`
  margin: 0 auto 1rem;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background-color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoIcon = styled.svg`
  width: 2rem;
  height: 2rem;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
`;

const FieldInner = styled.div`
  position: relative;
`;

const LeftIconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(156 163 175);
  pointer-events: none;
`;

const InputWithLeftIcon = styled(Input)`
  padding-left: 2.5rem;
`;

const InputWithSideIcons = styled(Input)`
  padding-left: 2.5rem;
  padding-right: 2.5rem;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(156 163 175);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: rgb(75 85 99);
  }
`;

const FullWidthPrimaryButton = styled(Button)`
  width: 100%;
  background-color: #22c55e;
  color: white;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

const BottomText = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const TextLinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #22c55e;
  cursor: pointer;

  &:hover {
    color: #16a34a;
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("cristiano@whatschat.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const result = await login(email, password);
      if (result.success) {
        router.push("/");
      }
    }
  };

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthPageShell>
      <AuthCard>
        <CardHeader>
          <LogoCircle>
            <LogoIcon fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </LogoIcon>
          </LogoCircle>
          <CardTitle>
            登录 Instagram
          </CardTitle>
          <CardDescription>请输入您的邮箱和密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Label htmlFor="email">邮箱</Label>
              <FieldInner>
                <LeftIconWrapper>
                  <Mail size={16} />
                </LeftIconWrapper>
                <InputWithLeftIcon
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldInner>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="password">密码</Label>
              <FieldInner>
                <LeftIconWrapper>
                  <Lock size={16} />
                </LeftIconWrapper>
                <InputWithSideIcons
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <TogglePasswordButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </TogglePasswordButton>
              </FieldInner>
            </FieldGroup>

            <FullWidthPrimaryButton type="submit" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </FullWidthPrimaryButton>

            <BottomText>
              还没有账号？
              <TextLinkButton
                type="button"
                onClick={() => router.push("/register")}
              >
                立即注册
              </TextLinkButton>
            </BottomText>
          </Form>
        </CardContent>
      </AuthCard>
    </AuthPageShell>
  );
}
