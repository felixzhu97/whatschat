import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { TabPageHeader, TAB_PAGE_HEADER_HEIGHT } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useTranslation } from '@/src/presentation/shared/i18n';

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  padding-bottom: 88px;
`;

const ContentWrap = styled.View`
  flex: 1;
  padding-top: ${TAB_PAGE_HEADER_HEIGHT}px;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 48px;
`;

const EmptyIcon = styled.View`
  margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
  margin-bottom: 8px;
`;

const EmptySubtitle = styled.Text`
  font-size: 15px;
  color: ${(p) => p.theme.colors.secondaryText};
  text-align: center;
`;

export const CommunitiesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <TabPageHeader title={t('communities.title')} />
        <ContentWrap>
        <EmptyState>
          <EmptyIcon>
            <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
          </EmptyIcon>
          <EmptyTitle>{t('communities.noCommunities')}</EmptyTitle>
          <EmptySubtitle>{t('communities.noCommunitiesHint')}</EmptySubtitle>
        </EmptyState>
        </ContentWrap>
      </Page>
    </SafeAreaView>
  );
};
