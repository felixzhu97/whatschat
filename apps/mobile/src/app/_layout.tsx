import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '@/src/presentation/shared/theme';
import { StatusBar } from 'expo-status-bar';
import { CallOverlay } from '@/src/presentation/components';
import { StoreProvider } from '@/src/presentation/store/StoreProvider';
import { styled } from '@/src/presentation/shared/emotion';
import { applyStoredLanguage } from '@/src/presentation/shared/i18n';
import '@/src/presentation/shared/i18n/i18n';

const OverlayWrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

function ThemeAwareLayout() {
  const { colors, isDark } = useTheme();
  React.useEffect(() => {
    applyStoredLanguage();
  }, []);
  return (
    <>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={colors.secondaryBackground}
      />
      <View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen
            name="chat-detail"
            options={{
              headerShown: true,
              presentation: 'card',
            }}
          />
        </Stack>
        <OverlayWrap pointerEvents="box-none">
          <CallOverlay />
        </OverlayWrap>
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <ThemeAwareLayout />
      </ThemeProvider>
    </StoreProvider>
  );
}
