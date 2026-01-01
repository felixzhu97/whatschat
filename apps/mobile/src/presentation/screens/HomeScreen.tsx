import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusScreen } from './StatusScreen';
import { CallsScreen } from './CallsScreen';
import { CommunitiesScreen } from './CommunitiesScreen';
import { ChatListScreen } from './ChatListScreen';
import { SettingsScreen } from './SettingsScreen';
import { useTheme } from '@/src/presentation/shared/theme';

const Tab = createBottomTabNavigator();

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
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
      <Tab.Screen
        name="Status"
        component={StatusScreen}
        options={{
          title: '更新',
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipse" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsScreen}
        options={{
          title: '通话',
          tabBarIcon: ({ color, size }) => <Ionicons name="call" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{
          title: '社区',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          title: '聊天',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

