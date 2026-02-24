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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAppDispatch, setAuth } from '@/src/presentation/stores';
import { authService } from '@/src/application/services';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUsername || !trimmedEmail || !password) {
      Alert.alert('提示', '请填写用户名、邮箱和密码');
      return;
    }
    if (trimmedUsername.length < 2) {
      Alert.alert('提示', '用户名至少 2 个字符');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });
      await dispatch(setAuth({ token: data.token, refreshToken: data.refreshToken, user: data.user })).unwrap();
      router.replace('/(tabs)/chats');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : '注册失败';
      Alert.alert('注册失败', String(message));
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
          <Text style={styles.headerSubtitle}>创建账号</Text>
        </View>
        <ScrollView
          style={[styles.form, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.secondaryText }]}>用户名</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.secondaryBackground,
                color: colors.primaryText,
                borderColor: colors.separator,
              },
            ]}
            placeholder="至少 2 个字符"
            placeholderTextColor={colors.tertiaryText}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
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
            keyboardType="email-address"
            autoCapitalize="none"
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>创建账号</Text>
            )}
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>已有账号？</Text>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={[styles.link, { color: colors.primaryGreen }]}>登录</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
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
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
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
