import React from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatAvatar, TabPageHeader, TAB_PAGE_HEADER_HEIGHT } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore, useAppDispatch, logout as logoutThunk } from '@/src/presentation/stores';

const SECTION_RADIUS = 12;
const ROW_HEIGHT = 52;

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutThunk());
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
        <TabPageHeader title="设置" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 24 + TAB_PAGE_HEADER_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.secondaryBackground,
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderRadius: SECTION_RADIUS,
            marginBottom: 32,
          }}
        >
          <ChatAvatar name={user?.username ?? 'User'} size={64} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text
              style={{ fontSize: 20, fontWeight: '600', color: colors.primaryText }}
              numberOfLines={1}
            >
              {user?.username ?? '未设置'}
            </Text>
            <Text
              style={{ fontSize: 15, color: colors.secondaryText, marginTop: 2 }}
              numberOfLines={1}
            >
              {user?.email ?? ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.secondaryText} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.secondaryText,
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          账号
        </Text>
        <View
          style={{
            backgroundColor: colors.secondaryBackground,
            borderRadius: SECTION_RADIUS,
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.separator,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.primaryText, flex: 1 }}>用户名</Text>
            <Text style={{ fontSize: 17, color: colors.secondaryText, marginRight: 8 }} numberOfLines={1}>
              {user?.username ?? '—'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.primaryText, flex: 1 }}>邮箱</Text>
            <Text style={{ fontSize: 17, color: colors.secondaryText, marginRight: 8 }} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.secondaryText,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          聊天
        </Text>
        <View
          style={{
            backgroundColor: colors.secondaryBackground,
            borderRadius: SECTION_RADIUS,
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.separator,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.primaryText, flex: 1 }}>主题</Text>
            <Text style={{ fontSize: 17, color: colors.secondaryText, marginRight: 8 }}>浅色</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.primaryText, flex: 1 }}>聊天壁纸</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={{
            marginTop: 32,
            backgroundColor: colors.secondaryBackground,
            borderRadius: SECTION_RADIUS,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.iosRed }}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};
