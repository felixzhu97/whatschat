import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';

export default function Index() {
  const { colors } = useTheme();
  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isReady) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)/chats" />;
  }
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
