import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/presentation/shared/theme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.iosBlue,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.secondaryBackground,
          borderTopColor: colors.separator,
        },
      }}
    >
      <Tabs.Screen
        name="status"
        options={{
          title: '更新',
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipse" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: '通话',
          tabBarIcon: ({ color, size }) => <Ionicons name="call" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: '社区',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: '聊天',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

