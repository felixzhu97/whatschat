import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatAvatar, TabPageHeader, TAB_PAGE_HEADER_HEIGHT } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, logout as logoutThunk } from '@/src/presentation/stores';
import { styled } from '@/src/presentation/shared/emotion';
import { useTranslation } from '@/src/presentation/shared/i18n';
import { setStoredLanguage, type AppLanguage } from '@/src/presentation/shared/i18n';
import type { ThemeMode } from '@/src/presentation/shared/theme';

const LIST_INSET = 16;
const ROW_MIN_HEIGHT = 44;
const CARD_RADIUS = 12;
const PROFILE_CARD_RADIUS = 14;
const CARD_GAP = 20;
const CARD_PADDING_V = 12;
const CARD_PADDING_H = 16;

const ScreenWrap = styled.View`
  flex: 1;
`;

const Scroll = styled.ScrollView`
  flex: 1;
`;

const SCROLL_PADDING_TOP = 12 + TAB_PAGE_HEADER_HEIGHT;

const ScrollContent = styled.View`
  padding-bottom: 100px;
  padding-horizontal: ${LIST_INSET}px;
  padding-top: ${LIST_INSET}px;
`;

const CARD_INSET_H = 12;

const ProfileCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: 16px;
  padding-horizontal: ${LIST_INSET}px;
  margin-bottom: ${CARD_GAP}px;
  margin-horizontal: ${CARD_INSET_H}px;
  border-radius: ${PROFILE_CARD_RADIUS}px;
  overflow: hidden;
`;

const ProfileInfo = styled.View`
  margin-left: 16px;
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const ProfileSubtitle = styled.Text`
  font-size: 15px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } })?.colors?.secondaryText};
  margin-top: 1px;
`;

const Card = styled.View`
  border-radius: ${CARD_RADIUS}px;
  overflow: hidden;
  margin-top: ${CARD_GAP}px;
  margin-bottom: ${CARD_GAP}px;
  margin-horizontal: ${CARD_INSET_H}px;
  padding-top: ${CARD_PADDING_V}px;
  padding-bottom: ${CARD_PADDING_V}px;
  padding-horizontal: ${CARD_PADDING_H}px;
`;

const ICON_SIZE = 28;
const ICON_RADIUS = 8;

const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  min-height: ${ROW_MIN_HEIGHT}px;
  padding-vertical: 11px;
  padding-horizontal: 0;
`;

const RowBorder = styled(Row)`
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => (p.theme as { colors?: { separator?: string } })?.colors?.separator};
`;

const rowIconWrapStyle = StyleSheet.create({
  outer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function RowIconGradient({
  colors,
  children,
}: {
  colors: [string, string];
  children: React.ReactNode;
}) {
  return (
    <View style={rowIconWrapStyle.outer}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={rowIconWrapStyle.inner}>{children}</View>
    </View>
  );
}

const RowLabel = styled.Text`
  font-size: 17px;
  font-weight: 400;
  flex: 1;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const RowValue = styled.Text`
  font-size: 15px;
  margin-right: 8px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } })?.colors?.secondaryText};
`;

const LogoutRow = styled.TouchableOpacity`
  margin-top: 32px;
  align-items: center;
  padding-vertical: 16px;
`;

const LogoutText = styled.Text`
  font-size: 17px;
  font-weight: 400;
  color: ${(p) => (p.theme as { colors?: { iosRed?: string } })?.colors?.iosRed};
`;

const THEME_OPTIONS: { mode: ThemeMode; key: 'themeLight' | 'themeDark' | 'themeSystem' }[] = [
  { mode: 'light', key: 'themeLight' },
  { mode: 'dark', key: 'themeDark' },
  { mode: 'system', key: 'themeSystem' },
];

const LANGUAGE_OPTIONS: { lng: AppLanguage; key: 'languageEnglish' | 'languageChinese' }[] = [
  { lng: 'en', key: 'languageEnglish' },
  { lng: 'zh', key: 'languageChinese' },
];

function iconGradient(base: string, lighter: string): [string, string] {
  return [lighter, base];
}

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();
  const user = useAuthStore((s) => s.user);

  const grad = {
    blue: iconGradient(colors.iosBlue, '#4DA3FF'),
    green: iconGradient(colors.iosGreen, '#5CD87D'),
    red: iconGradient(colors.iosRed, '#FF6B6B'),
    orange: iconGradient(colors.iosOrange, '#FFB340'),
    purple: iconGradient(colors.iosPurple, '#C77EFF'),
    pink: iconGradient(colors.iosPink, '#FF5AA8'),
    teal: iconGradient(colors.iosTeal, '#7DD4FC'),
  };

  const languageLabel = i18n.language === 'zh' ? t('settings.languageChinese') : t('settings.languageEnglish');

  const themeLabel =
    themeMode === 'system'
      ? t('settings.themeSystem')
      : themeMode === 'dark'
        ? t('settings.themeDark')
        : t('settings.themeLight');

  const handleThemePress = () => {
    Alert.alert(t('settings.theme'), undefined, [
      ...THEME_OPTIONS.map(({ mode, key }) => ({
        text: t(`settings.${key}`),
        onPress: () => setThemeMode(mode),
      })),
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleLanguagePress = () => {
    Alert.alert(t('settings.language'), undefined, [
      ...LANGUAGE_OPTIONS.map(({ lng, key }) => ({
        text: t(`settings.${key}`),
        onPress: async () => {
          await setStoredLanguage(lng);
          await i18n.changeLanguage(lng);
        },
      })),
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logoutConfirmTitle'), t('settings.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutThunk());
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScreenWrap style={{ backgroundColor: colors.tertiaryBackground }}>
        <TabPageHeader title={t('settings.title')} />
        <Scroll
          style={{ backgroundColor: colors.tertiaryBackground }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: SCROLL_PADDING_TOP }}
        >
          <ScrollContent style={{ backgroundColor: colors.tertiaryBackground }}>
            <ProfileCard
              activeOpacity={0.7}
              style={{ backgroundColor: colors.secondaryBackground }}
            >
              <ChatAvatar name={user?.username ?? 'User'} size={56} />
              <ProfileInfo>
                <ProfileName numberOfLines={1}>{user?.username ?? t('common.notSet')}</ProfileName>
                <ProfileSubtitle numberOfLines={1}>{t('settings.profileAbout')}</ProfileSubtitle>
              </ProfileInfo>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </ProfileCard>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <RowBorder activeOpacity={0.7}>
                <RowIconGradient colors={grad.blue}>
                  <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.privacy')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowBorder>
              <RowBorder activeOpacity={0.7}>
                <RowIconGradient colors={grad.green}>
                  <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.security')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowBorder>
              <RowBorder activeOpacity={0.7}>
                <RowIconGradient colors={grad.orange}>
                  <Ionicons name="key" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.twoStepVerification')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowBorder>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.teal}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.username')}</RowLabel>
                <RowValue numberOfLines={1}>{user?.username ?? t('common.none')}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.blue}>
                  <Ionicons name="mail" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.email')}</RowLabel>
                <RowValue numberOfLines={1}>{user?.email ?? t('common.none')}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <RowBorder activeOpacity={0.7} onPress={handleThemePress}>
                <RowIconGradient colors={grad.pink}>
                  <Ionicons name="color-palette" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.theme')}</RowLabel>
                <RowValue>{themeLabel}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowBorder>
              <RowBorder activeOpacity={0.7} onPress={handleLanguagePress}>
                <RowIconGradient colors={grad.blue}>
                  <Ionicons name="language" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.language')}</RowLabel>
                <RowValue>{languageLabel}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowBorder>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.purple}>
                  <Ionicons name="images" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.chatWallpaper')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.red}>
                  <Ionicons name="notifications" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.messageNotifications')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.blue}>
                  <Ionicons name="folder" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.storageUsage')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.blue}>
                  <Ionicons name="help-circle" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.helpCenter')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <Card style={{ backgroundColor: colors.secondaryBackground }}>
              <Row activeOpacity={0.7}>
                <RowIconGradient colors={grad.green}>
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                </RowIconGradient>
                <RowLabel>{t('settings.inviteFriend')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </Card>

            <LogoutRow activeOpacity={0.7} onPress={handleLogout}>
              <LogoutText>{t('settings.logout')}</LogoutText>
            </LogoutRow>
          </ScrollContent>
        </Scroll>
      </ScreenWrap>
    </SafeAreaView>
  );
};
