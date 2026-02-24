import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassBar } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { styled } from '@/src/presentation/shared/emotion';

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-vertical: 10px;
`;

const Pill = styled.View`
  position: absolute;
  left: 6px;
  right: 6px;
  top: 6px;
  bottom: 6px;
  border-radius: 18px;
  background-color: ${(p) =>
    (p.theme as { isDark?: boolean })?.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'};
`;

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => <LiquidGlassBar />,
        tabBarButton: (props) => {
          const focused = props.accessibilityState?.selected ?? false;
          return (
            <TabButton
              style={props.style}
              onPress={props.onPress ?? undefined}
              onLongPress={props.onLongPress ?? undefined}
              accessibilityState={props.accessibilityState}
              accessibilityRole="button"
            >
              {focused && <Pill pointerEvents="none" />}
              {props.children}
            </TabButton>
          );
        },
      }}
    >
      <Tabs.Screen
        name="status"
        options={{
          title: '更新',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'ellipse' : 'ellipse-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: '通话',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="call" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: '社区',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: '聊天',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
