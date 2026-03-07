"use client";

import { useState } from "react";
import { LayoutGrid, Bookmark, UserCheck, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import { Button } from "@/src/presentation/components/ui/button";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";
import type { FeedPost } from "@/shared/types";

const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BORDER = "1px solid rgb(219 219 219)";
const BG_BUTTON = "rgb(239 239 239)";

const PageRoot = styled.div`
  flex: 1;
  min-width: 0;
  overflow: auto;
  background-color: rgb(255 255 255);
`;

const ContentWrap = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px 0;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 44px;
  gap: 80px;
  padding-bottom: 44px;
  border-bottom: ${BORDER};
`;

const AvatarWrap = styled.div`
  flex-shrink: 0;
`;

const AvatarLarge = styled(Avatar)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
`;

const FallbackLarge = styled(AvatarFallback)`
  font-size: 48px;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366);
  color: white;
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Username = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 300;
  color: ${TEXT_PRIMARY};
  line-height: 1.2;
`;

const VerifiedDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${TEXT_PRIMARY};
`;

const FullName = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 16px;
  color: ${TEXT_PRIMARY};
`;

const Stat = styled.span`
  font-weight: 400;
`;

const Handle = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${TEXT_SECONDARY};
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionBtn = styled(Button)`
  padding: 7px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  background-color: ${BG_BUTTON};
  color: ${TEXT_PRIMARY};
  border: none;

  &:hover {
    background-color: rgb(219 219 219);
  }
`;

const NewSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 44px;
`;

const NewBtn = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid ${TEXT_PRIMARY};
  background: transparent;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgb(239 239 239);
  }
`;

const NewLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const TabsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  border-top: ${BORDER};
  margin-bottom: 0;
`;

const Tab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  margin-top: -1px;
  border: none;
  border-top: 1px solid ${(p) => (p.$active ? TEXT_PRIMARY : "transparent")};
  background: none;
  cursor: pointer;
  color: ${(p) => (p.$active ? TEXT_PRIMARY : TEXT_SECONDARY)};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 80px;
  justify-content: center;

  &:hover {
    color: ${TEXT_PRIMARY};
  }
`;

const TabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const GridCell = styled.button`
  aspect-ratio: 1;
  padding: 0;
  border: none;
  background: rgb(239 239 239);
  cursor: pointer;
  overflow: hidden;
  display: block;
`;

const GridImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Footer = styled.footer`
  margin-top: 48px;
  padding: 24px 0 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const FooterLinks = styled.div`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  text-align: center;
  line-height: 1.6;
`;

const FooterLang = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

const FooterCopy = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
`;

export interface ProfilePageProps {
  user: {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
  } | null | undefined;
  posts: FeedPost[];
  onEditProfile?: () => void;
  onViewArchive?: () => void;
  onNewPost?: () => void;
  onPostClick?: (post: FeedPost) => void;
}

type ProfileTab = "grid" | "saved" | "tagged";

export function ProfilePage({
  user,
  posts,
  onEditProfile,
  onViewArchive,
  onNewPost,
  onPostClick,
}: ProfilePageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProfileTab>("grid");

  const myPosts = posts.filter((p) => p.userId === user?.id);
  const postCount = myPosts.length;
  const followersCount = 0;
  const followingCount = 0;
  const username = user?.username ?? "";
  const fullName = user?.name ?? "";
  const handleStr = username ? `@${username}` : "";

  return (
    <PageRoot>
      <ContentWrap>
        <ProfileHeader>
          <AvatarWrap>
            <AvatarLarge>
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <FallbackLarge>{(fullName || username || "?")[0]}</FallbackLarge>
            </AvatarLarge>
          </AvatarWrap>
          <InfoBlock>
            <UsernameRow>
              <Username>{username || fullName || "—"}</Username>
              <VerifiedDot />
            </UsernameRow>
            {fullName && <FullName>{fullName}</FullName>}
            <StatsRow>
              <Stat>{t("profile.postsCount", { count: String(postCount) } as Record<string, string>)}</Stat>
              <Stat>{t("profile.followersCount", { count: String(followersCount) } as Record<string, string>)}</Stat>
              <Stat>{t("profile.followingCount", { count: String(followingCount) } as Record<string, string>)}</Stat>
            </StatsRow>
            {handleStr && <Handle>{handleStr}</Handle>}
            <ActionsRow>
              <ActionBtn onClick={onEditProfile}>{t("profile.editProfile")}</ActionBtn>
              <ActionBtn onClick={onViewArchive}>{t("profile.viewArchive")}</ActionBtn>
            </ActionsRow>
          </InfoBlock>
        </ProfileHeader>

        <NewSection>
          <NewBtn type="button" onClick={onNewPost} aria-label={t("profile.new")}>
            <Plus size={24} strokeWidth={2} />
          </NewBtn>
          <NewLabel>{t("profile.new")}</NewLabel>
        </NewSection>

        <TabsRow>
          <Tab $active={activeTab === "grid"} onClick={() => setActiveTab("grid")}>
            <TabIcon>
              <LayoutGrid size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabGrid")}
          </Tab>
          <Tab $active={activeTab === "saved"} onClick={() => setActiveTab("saved")}>
            <TabIcon>
              <Bookmark size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabSaved")}
          </Tab>
          <Tab $active={activeTab === "tagged"} onClick={() => setActiveTab("tagged")}>
            <TabIcon>
              <UserCheck size={12} strokeWidth={2} />
            </TabIcon>
            {t("profile.tabTagged")}
          </Tab>
        </TabsRow>

        {activeTab === "grid" && (
          <GridWrap>
            {myPosts.map((post) => (
              <GridCell key={post.id} type="button" onClick={() => onPostClick?.(post)}>
                <GridImg src={post.imageUrl} alt="" />
              </GridCell>
            ))}
          </GridWrap>
        )}
        {activeTab === "saved" && <GridWrap />}
        {activeTab === "tagged" && <GridWrap />}

        <Footer>
          <FooterLinks>{t("profile.footerLinks")}</FooterLinks>
          <FooterLang>{t("profile.language")} ▼</FooterLang>
          <FooterCopy>{t("profile.copyright")}</FooterCopy>
        </Footer>
      </ContentWrap>
    </PageRoot>
  );
}
