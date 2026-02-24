import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, logout as logoutThunk } from '@/src/presentation/stores';

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

const Section = styled.View`
  margin-top: 24px;
`;

const SectionHeader = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.secondaryText};
  padding: 8px 16px;
  text-transform: uppercase;
`;

const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-bottom-width: 0.5px;
  border-bottom-color: ${(p) => p.theme.colors.separator};
`;

const RowLabel = styled.Text`
  flex: 1;
  font-size: 17px;
  color: ${(p) => p.theme.colors.primaryText};
`;

const RowValue = styled.Text`
  font-size: 17px;
  color: ${(p) => p.theme.colors.secondaryText};
  margin-right: 8px;
`;

const LogoutRow = styled(Row)`
  margin-top: 24px;
  justify-content: center;
`;

const LogoutText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.iosRed};
`;

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
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
      <Page>
        <Header>
          <HeaderRow>
            <Title>设置</Title>
          </HeaderRow>
        </Header>
        <Section>
          <SectionHeader>账号</SectionHeader>
          {user && (
            <>
              <Row activeOpacity={0.7}>
                <RowLabel>用户名</RowLabel>
                <RowValue>{user.username}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
              <Row activeOpacity={0.7}>
                <RowLabel>邮箱</RowLabel>
                <RowValue numberOfLines={1}>{user.email}</RowValue>
                <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
              </Row>
            </>
          )}
        </Section>
        <LogoutRow onPress={handleLogout} activeOpacity={0.7}>
          <LogoutText>退出登录</LogoutText>
        </LogoutRow>
      </Page>
    </SafeAreaView>
  );
};
