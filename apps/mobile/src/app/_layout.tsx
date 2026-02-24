import { View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/src/presentation/shared/theme';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { CallOverlay } from '@/src/presentation/components';
import { StoreProvider } from '@/src/presentation/store/StoreProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StoreProvider>
    <ThemeProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
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
              title: '聊天',
              presentation: 'card',
            }}
          />
        </Stack>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
          <CallOverlay />
        </View>
      </View>
    </ThemeProvider>
    </StoreProvider>
  );
}
