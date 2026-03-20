import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassBar } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useTranslation } from '@/src/presentation/shared/i18n';
import { useAuthStore } from '@/src/presentation/stores';
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
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const isReady = useAuthStore((s) => s.isReady);

  if (isReady && !token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarShowLabel: false,
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
          title: t('tabs.status'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: t('tabs.reels'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'videocam' : 'videocam-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('tabs.chats'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: t('tabs.calls'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
