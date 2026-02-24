"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/presentation/hooks";
import { WhatsAppMain } from "@/src/presentation/components/whatsapp-main";
import { styled } from "@/src/shared/utils/emotion";

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const Spinner = styled.div`
  margin: 0 auto 1rem;
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  border-bottom-color: #22c55e;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <LoadingScreen>
        <LoadingContent>
          <Spinner />
          <LoadingText>加载中...</LoadingText>
        </LoadingContent>
      </LoadingScreen>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <WhatsAppMain />;
}
