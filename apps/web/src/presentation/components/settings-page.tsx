"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Shield, Palette, Globe, HelpCircle, LogOut, Camera } from "lucide-react";
import { Button } from "@/src/presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/presentation/components/ui/card";
import { Switch } from "@/src/presentation/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "../hooks/use-auth";

interface SettingsPageProps {
  onBack: () => void;
  onProfileClick: () => void;
}

const PageRoot = styled.div`
  height: 100vh;
  background-color: rgb(249 250 251);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background-color: #16a34a;
  color: white;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackBtn = styled(Button)`
  color: white;

  &:hover {
    background-color: #15803d;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
`;

const ArrowIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfileCard = styled(Card)`
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
`;

const ProfileCardContent = styled(CardContent)`
  padding: 1rem;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarMedium = styled(Avatar)`
  height: 4rem;
  width: 4rem;
`;

const FallbackText = styled(AvatarFallback)`
  font-size: 1.125rem;
`;

const CameraBadge = styled.div`
  position: absolute;
  bottom: -0.25rem;
  right: -0.25rem;
  background-color: #22c55e;
  border-radius: 9999px;
  padding: 0.25rem;
`;

const CameraIcon = styled(Camera)`
  height: 0.75rem;
  width: 0.75rem;
  color: white;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  font-weight: 600;
  font-size: 1.125rem;
`;

const ProfileAbout = styled.p`
  color: rgb(75 85 99);
`;

const ProfilePhone = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
`;

const CardTitleRow = styled(CardTitle)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Icon20 = styled(Bell)`
  height: 1.25rem;
  width: 1.25rem;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SettingText = styled.div``;

const SettingTitle = styled.p`
  font-weight: 500;
`;

const SettingDesc = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const CardContentSpaced = styled(CardContent)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardContentSpaced3 = styled(CardContent)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FullWidthBtn = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`;

const LogoutBtn = styled(Button)`
  width: 100%;
`;

const LogoutCardContent = styled(CardContent)`
  padding: 1rem;
`;

const LogoutIcon = styled(LogOut)`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
`;

const ShieldIcon = styled(Shield)`
  height: 1.25rem;
  width: 1.25rem;
`;

const PaletteIcon = styled(Palette)`
  height: 1.25rem;
  width: 1.25rem;
`;

const GlobeIcon = styled(Globe)`
  height: 1.25rem;
  width: 1.25rem;
`;

const HelpIcon = styled(HelpCircle)`
  height: 1.25rem;
  width: 1.25rem;
`;

export function SettingsPage({ onBack, onProfileClick }: SettingsPageProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <PageRoot>
      <Header>
        <HeaderRow>
          <BackBtn variant="ghost" size="icon" onClick={onBack}>
            <ArrowIcon />
          </BackBtn>
          <Title>设置</Title>
        </HeaderRow>
      </Header>

      <Content>
        <ProfileCard onClick={onProfileClick}>
          <ProfileCardContent>
            <ProfileRow>
              <AvatarWrap>
                <AvatarMedium>
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=64&width=64&text=我"} />
                  <FallbackText>{user?.name?.[0] || "我"}</FallbackText>
                </AvatarMedium>
                <CameraBadge>
                  <CameraIcon />
                </CameraBadge>
              </AvatarWrap>
              <ProfileInfo>
                <ProfileName>{user?.name || "我的名字"}</ProfileName>
                <ProfileAbout>{user?.about || "嗨，我正在使用 WhatsApp！"}</ProfileAbout>
                <ProfilePhone>{user?.phone || "+86 138 0013 8000"}</ProfilePhone>
              </ProfileInfo>
            </ProfileRow>
          </ProfileCardContent>
        </ProfileCard>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <Icon20 />
              通知
            </CardTitleRow>
            <CardDescription>管理消息通知设置</CardDescription>
          </CardHeader>
          <CardContentSpaced>
            <SettingRow>
              <SettingText>
                <SettingTitle>消息通知</SettingTitle>
                <SettingDesc>接收新消息通知</SettingDesc>
              </SettingText>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </SettingRow>
            <SettingRow>
              <SettingText>
                <SettingTitle>已读回执</SettingTitle>
                <SettingDesc>发送已读回执给联系人</SettingDesc>
              </SettingText>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </SettingRow>
            <SettingRow>
              <SettingText>
                <SettingTitle>最后在线时间</SettingTitle>
                <SettingDesc>显示最后在线时间</SettingDesc>
              </SettingText>
              <Switch checked={lastSeen} onCheckedChange={setLastSeen} />
            </SettingRow>
          </CardContentSpaced>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <ShieldIcon />
              隐私
            </CardTitleRow>
            <CardDescription>管理隐私和安全设置</CardDescription>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">阻止的联系人</FullWidthBtn>
            <FullWidthBtn variant="ghost">两步验证</FullWidthBtn>
            <FullWidthBtn variant="ghost">更改号码</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <PaletteIcon />
              外观
            </CardTitleRow>
            <CardDescription>自定义应用外观</CardDescription>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">主题</FullWidthBtn>
            <FullWidthBtn variant="ghost">聊天壁纸</FullWidthBtn>
            <FullWidthBtn variant="ghost">字体大小</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <GlobeIcon />
              语言
            </CardTitleRow>
          </CardHeader>
          <CardContent>
            <FullWidthBtn variant="ghost">应用语言</FullWidthBtn>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <HelpIcon />
              帮助
            </CardTitleRow>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">常见问题</FullWidthBtn>
            <FullWidthBtn variant="ghost">联系我们</FullWidthBtn>
            <FullWidthBtn variant="ghost">服务条款和隐私政策</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <LogoutCardContent>
            <LogoutBtn variant="destructive" onClick={handleLogout}>
              <LogoutIcon />
              退出登录
            </LogoutBtn>
          </LogoutCardContent>
        </Card>
      </Content>
    </PageRoot>
  );
}
