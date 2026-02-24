import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, setAuth } from '@/src/presentation/stores';
import { authService } from '@/src/application/services';

const DEFAULT_DEV_USER = { email: 'ladygaga@whatschat.com', password: '123456' };

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primaryGreenDark }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={[styles.header, { backgroundColor: colors.primaryGreenDark }]}>
          <Text style={styles.headerTitle}>WhatsChat</Text>
          <Text style={styles.headerSubtitle}>登录以继续</Text>
        </View>
        <View style={[styles.form, { backgroundColor: colors.background }]}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>邮箱</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.primaryText,
                borderColor: colors.separator,
              },
            ]}
            placeholder="your@email.com"
            placeholderTextColor={colors.tertiaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            editable={!loading}
          />
          <Text style={[styles.label, { color: colors.secondaryText }]}>密码</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.primaryText,
                borderColor: colors.separator,
              },
            ]}
            placeholder="至少 6 位"
            placeholderTextColor={colors.tertiaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primaryGreen }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>登录</Text>
            )}
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>还没有账号？</Text>
            <Link href="/register" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={[styles.link, { color: colors.primaryGreen }]}>创建账号</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
  },
  form: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 17,
    marginBottom: 20,
  },
  primaryButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
  },
});
