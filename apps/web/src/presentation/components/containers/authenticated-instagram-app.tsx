"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/presentation/hooks";
import { InstagramMain } from "@/src/presentation/components/containers/instagram-main";
import {
  InstagramLoadingSplash,
  FromMetaBadge,
} from "@/src/presentation/components/ui/instagram-loading-splash";
import { styled } from "@/src/shared/utils/emotion";

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255);
  position: relative;
`;

const LoadingContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export type InstagramRoutePage =
  | "home"
  | "messages"
  | "reels"
  | "explore"
  | "profile"
  | "settings"
  | "status"
  | "calls"
  | "starred"
  | "search";

export function AuthenticatedInstagramApp({
  routePage = "home",
  profileUserId,
}: {
  routePage?: InstagramRoutePage;
  profileUserId?: string;
}) {
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
          <InstagramLoadingSplash logoSize={64} />
        </LoadingContent>
        <FromMetaBadge />
      </LoadingScreen>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <InstagramMain routePage={routePage} profileUserId={profileUserId} />;
}
