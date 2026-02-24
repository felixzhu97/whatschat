import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, setAuth } from '@/src/presentation/stores';
import { authService } from '@/src/application/services';

const DEFAULT_DEV_USER = { email: 'ladygaga@whatschat.com', password: '123456' };

const Page = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.primaryGreenDark};
`;

const Keyboard = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const Header = styled.View`
  padding: 48px 24px 24px;
  background-color: ${(p) => p.theme.colors.primaryGreenDark};
`;

const HeaderTitle = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
`;

const HeaderSubtitle = styled.Text`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8px;
`;

const Form = styled.View`
  flex: 1;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 32px 24px 0;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

const Label = styled.Text`
  font-size: 13px;
  margin-bottom: 6px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Input = styled.TextInput`
  height: 48px;
  border-radius: 10px;
  border-width: 1px;
  padding: 0 16px;
  font-size: 17px;
  margin-bottom: 20px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  color: ${(p) => p.theme.colors.primaryText};
  border-color: ${(p) => p.theme.colors.separator};
`;

const PrimaryButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: 25px;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const PrimaryButtonText = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
`;

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const FooterText = styled.Text`
  font-size: 15px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const LinkText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primaryGreen};
`;

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(DEFAULT_DEV_USER.email);
  const [password, setPassword] = useState(DEFAULT_DEV_USER.password);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login({ email: trimmedEmail, password });
      await dispatch(setAuth({ token: data.token, refreshToken: data.refreshToken, user: data.user })).unwrap();
      router.replace('/(tabs)/chats');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : '登录失败';
      Alert.alert('登录失败', String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Page>
        <Keyboard behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Header>
            <HeaderTitle>WhatsChat</HeaderTitle>
            <HeaderSubtitle>登录以继续</HeaderSubtitle>
          </Header>
          <Form>
            <Label>邮箱</Label>
            <Input
              placeholder="your@email.com"
              placeholderTextColor={colors.tertiaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />
            <Label>密码</Label>
            <Input
              placeholder="至少 6 位"
              placeholderTextColor={colors.tertiaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <PrimaryButton onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <PrimaryButtonText>登录</PrimaryButtonText>
              )}
            </PrimaryButton>
            <Footer>
              <FooterText>还没有账号？</FooterText>
              <Link href="/register" asChild>
                <TouchableOpacity disabled={loading}>
                  <LinkText>创建账号</LinkText>
                </TouchableOpacity>
              </Link>
            </Footer>
          </Form>
        </Keyboard>
      </Page>
    </SafeAreaView>
  );
}
