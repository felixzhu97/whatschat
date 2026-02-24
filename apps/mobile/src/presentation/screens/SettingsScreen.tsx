import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatAvatar, TabPageHeader, TAB_PAGE_HEADER_HEIGHT } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, logout as logoutThunk } from '@/src/presentation/stores';
import { styled } from '@/src/presentation/shared/emotion';
import { useTranslation } from '@/src/presentation/shared/i18n';
import type { ThemeMode } from '@/src/presentation/shared/theme';

const SECTION_RADIUS = 12;

const ScreenWrap = styled.View`
  flex: 1;
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } })?.colors?.secondaryBackground};
`;

const Scroll = styled.ScrollView`
  flex: 1;
`;

const SCROLL_PADDING_TOP = 24 + TAB_PAGE_HEADER_HEIGHT;

const ScrollContent = styled.View`
  padding-bottom: 100px;
  padding-horizontal: 16px;
`;

const ProfileRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } })?.colors?.secondaryBackground};
  padding-vertical: 16px;
  padding-horizontal: 16px;
  border-radius: ${SECTION_RADIUS}px;
  margin-bottom: 32px;
`;

const ProfileInfo = styled.View`
  margin-left: 16px;
  flex: 1;
`;

const ProfileName = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const ProfileEmail = styled.Text`
  font-size: 15px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } })?.colors?.secondaryText};
  margin-top: 2px;
`;

const SectionTitle = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } })?.colors?.secondaryText};
  margin-bottom: 8px;
  padding-horizontal: 4px;
`;

const SectionTitleWithTop = styled(SectionTitle)`
  margin-top: 24px;
`;

const SectionBlock = styled.View`
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } })?.colors?.secondaryBackground};
  border-radius: ${SECTION_RADIUS}px;
  overflow: hidden;
`;

const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: 14px;
  padding-horizontal: 16px;
`;

const RowWithBorder = styled(Row)`
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => (p.theme as { colors?: { separator?: string } })?.colors?.separator};
`;

const RowLabel = styled.Text`
  font-size: 17px;
  flex: 1;
  color: ${(p) => (p.theme as { colors?: { primaryText?: string } })?.colors?.primaryText};
`;

const RowValue = styled.Text`
  font-size: 17px;
  margin-right: 8px;
  color: ${(p) => (p.theme as { colors?: { secondaryText?: string } })?.colors?.secondaryText};
`;

const LogoutButton = styled.TouchableOpacity`
  margin-top: 32px;
  background-color: ${(p) => (p.theme as { colors?: { secondaryBackground?: string } })?.colors?.secondaryBackground};
  border-radius: ${SECTION_RADIUS}px;
  padding-vertical: 16px;
  align-items: center;
`;

const LogoutText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => (p.theme as { colors?: { iosRed?: string } })?.colors?.iosRed};
`;

const THEME_OPTIONS: { mode: ThemeMode; key: 'themeLight' | 'themeDark' | 'themeSystem' }[] = [
  { mode: 'light', key: 'themeLight' },
  { mode: 'dark', key: 'themeDark' },
  { mode: 'system', key: 'themeSystem' },
];

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();
  const user = useAuthStore((s) => s.user);

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
      <ScreenWrap>
        <TabPageHeader title={t('settings.title')} />
        <Scroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: SCROLL_PADDING_TOP }}
        >
          <ScrollContent>
            <ProfileRow activeOpacity={0.7}>
              <ChatAvatar name={user?.username ?? 'User'} size={64} />
              <ProfileInfo>
                <ProfileName numberOfLines={1}>{user?.username ?? t('common.notSet')}</ProfileName>
                <ProfileEmail numberOfLines={1}>{user?.email ?? ''}</ProfileEmail>
              </ProfileInfo>
              <Ionicons name="chevron-forward" size={22} color={colors.secondaryText} />
            </ProfileRow>

            <SectionTitle>{t('settings.account')}</SectionTitle>
            <SectionBlock>
              <RowWithBorder activeOpacity={0.7}>
                <RowLabel>{t('settings.username')}</RowLabel>
                <RowValue numberOfLines={1}>{user?.username ?? t('common.none')}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowWithBorder>
              <Row activeOpacity={0.7}>
                <RowLabel>{t('settings.email')}</RowLabel>
                <RowValue numberOfLines={1}>{user?.email ?? t('common.none')}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </SectionBlock>

            <SectionTitleWithTop>{t('settings.chat')}</SectionTitleWithTop>
            <SectionBlock>
              <RowWithBorder activeOpacity={0.7} onPress={handleThemePress}>
                <RowLabel>{t('settings.theme')}</RowLabel>
                <RowValue>{themeLabel}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </RowWithBorder>
              <Row activeOpacity={0.7}>
                <RowLabel>{t('settings.chatWallpaper')}</RowLabel>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </SectionBlock>

            <LogoutButton activeOpacity={0.7} onPress={handleLogout}>
              <LogoutText>{t('settings.logout')}</LogoutText>
            </LogoutButton>
          </ScrollContent>
        </Scroll>
      </ScreenWrap>
    </SafeAreaView>
  );
};
