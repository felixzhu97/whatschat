import { Stack } from 'expo-router';
import { ThemeProvider } from '@/src/presentation/shared/theme';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="chat-detail" 
          options={{ 
            headerShown: true,
            title: '聊天',
            presentation: 'card',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
