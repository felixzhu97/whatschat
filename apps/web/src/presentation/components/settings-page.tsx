"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Shield, Palette, Globe, HelpCircle, LogOut, Camera } from "lucide-react";
import { Button } from "@/src/presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/presentation/components/ui/card";
import { Switch } from "@/src/presentation/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/presentation/components/ui/select";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "../hooks/use-auth";
import { useTranslation, setStoredLocale, type AppLocale } from "@/src/shared/i18n";

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
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);

  const currentLocale: AppLocale = i18n.language.startsWith("zh") ? "zh" : "en";

  const handleLocaleChange = (locale: AppLocale) => {
    setStoredLocale(locale);
    i18n.changeLanguage(locale);
  };

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
          <Title>{t("settings.title")}</Title>
        </HeaderRow>
      </Header>

      <Content>
        <ProfileCard onClick={onProfileClick}>
          <ProfileCardContent>
            <ProfileRow>
              <AvatarWrap>
                <AvatarMedium>
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=64&width=64&text=Me"} />
                  <FallbackText>{user?.name?.[0] || t("common.me")}</FallbackText>
                </AvatarMedium>
                <CameraBadge>
                  <CameraIcon />
                </CameraBadge>
              </AvatarWrap>
              <ProfileInfo>
                <ProfileName>{user?.name || t("settings.profileDefaultName")}</ProfileName>
                <ProfileAbout>{user?.about || t("settings.profileAbout")}</ProfileAbout>
                <ProfilePhone>{user?.phone || "+86 138 0013 8000"}</ProfilePhone>
              </ProfileInfo>
            </ProfileRow>
          </ProfileCardContent>
        </ProfileCard>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <Icon20 />
              {t("settings.notifications")}
            </CardTitleRow>
            <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
          </CardHeader>
          <CardContentSpaced>
            <SettingRow>
              <SettingText>
                <SettingTitle>{t("settings.messageNotifications")}</SettingTitle>
                <SettingDesc>{t("settings.messageNotificationsDesc")}</SettingDesc>
              </SettingText>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </SettingRow>
            <SettingRow>
              <SettingText>
                <SettingTitle>{t("settings.readReceipts")}</SettingTitle>
                <SettingDesc>{t("settings.readReceiptsDesc")}</SettingDesc>
              </SettingText>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </SettingRow>
            <SettingRow>
              <SettingText>
                <SettingTitle>{t("settings.lastSeen")}</SettingTitle>
                <SettingDesc>{t("settings.lastSeenDesc")}</SettingDesc>
              </SettingText>
              <Switch checked={lastSeen} onCheckedChange={setLastSeen} />
            </SettingRow>
          </CardContentSpaced>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <ShieldIcon />
              {t("settings.privacy")}
            </CardTitleRow>
            <CardDescription>{t("settings.privacyDesc")}</CardDescription>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">{t("settings.blockedContacts")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.twoStepVerification")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.changeNumber")}</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <PaletteIcon />
              {t("settings.appearance")}
            </CardTitleRow>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">{t("settings.theme")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.chatWallpaper")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.fontSize")}</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <GlobeIcon />
              {t("settings.language")}
            </CardTitleRow>
            <CardDescription>{t("settings.languageDesc")}</CardDescription>
          </CardHeader>
          <CardContentSpaced>
            <SettingRow>
              <SettingText>
                <SettingTitle>{t("settings.appLanguage")}</SettingTitle>
              </SettingText>
              <Select value={currentLocale} onValueChange={handleLocaleChange}>
                <SelectTrigger style={{ maxWidth: 160 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("settings.languageEnglish")}</SelectItem>
                  <SelectItem value="zh">{t("settings.languageChinese")}</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContentSpaced>
        </Card>

        <Card>
          <CardHeader>
            <CardTitleRow>
              <HelpIcon />
              {t("settings.help")}
            </CardTitleRow>
            <CardDescription>{t("settings.helpDesc")}</CardDescription>
          </CardHeader>
          <CardContentSpaced3>
            <FullWidthBtn variant="ghost">{t("settings.faq")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.contactUs")}</FullWidthBtn>
            <FullWidthBtn variant="ghost">{t("settings.termsAndPrivacy")}</FullWidthBtn>
          </CardContentSpaced3>
        </Card>

        <Card>
          <LogoutCardContent>
            <LogoutBtn variant="destructive" onClick={handleLogout}>
              <LogoutIcon />
              {t("settings.logout")}
            </LogoutBtn>
          </LogoutCardContent>
        </Card>
      </Content>
    </PageRoot>
  );
}
