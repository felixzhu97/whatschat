import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const Header = styled.View`
  padding: 14px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => p.theme.colors.separator};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryText};
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

export const CallsScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <Header>
          <HeaderRow>
            <Title>通话</Title>
          </HeaderRow>
        </Header>
        <EmptyState>
          <EmptyIcon>
            <Ionicons name="call-outline" size={64} color={colors.secondaryText} />
          </EmptyIcon>
          <EmptyTitle>暂无通话记录</EmptyTitle>
          <EmptySubtitle>与联系人通话后，记录将显示在这里</EmptySubtitle>
        </EmptyState>
      </Page>
    </SafeAreaView>
  );
};
