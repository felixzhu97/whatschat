import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { TabPageHeader, TAB_PAGE_HEADER_HEIGHT } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  padding-bottom: 88;
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
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <TabPageHeader title="社区" />
        <View style={{ flex: 1, paddingTop: TAB_PAGE_HEADER_HEIGHT }}>
        <EmptyState>
          <EmptyIcon>
            <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
          </EmptyIcon>
          <EmptyTitle>暂无社区</EmptyTitle>
          <EmptySubtitle>创建或加入社区，与多人一起交流</EmptySubtitle>
        </EmptyState>
        </View>
      </Page>
    </SafeAreaView>
  );
};
