import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, hydrateAuth } from '@/src/presentation/stores';

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
`;

export default function Index() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  if (!isReady) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </Centered>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)/status" />;
  }
  return <Redirect href="/login" />;
}
