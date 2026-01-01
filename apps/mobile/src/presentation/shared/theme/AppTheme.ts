export const AppTheme = {
  // WhatsApp iOS 主色调
  primaryGreen: '#1DAC5A',
  primaryGreenDark: '#128C7E',
  lightGreen: '#25D366',
  accentBlue: '#007AFF',

  // iOS 系统颜色
  iosBlue: '#007AFF',
  iosGreen: '#34C759',
  iosRed: '#FF3B30',
  iosOrange: '#FF9500',
  iosPurple: '#AF52DE',
  iosYellow: '#FFCC00',
  iosPink: '#FF2D92',
  iosTeal: '#5AC8FA',

  // 背景色 - iOS 风格
  lightBackground: '#F2F2F7',
  darkBackground: '#000000',
  lightSecondaryBackground: '#FFFFFF',
  darkSecondaryBackground: '#1C1C1E',
  lightTertiaryBackground: '#F2F2F7',
  darkTertiaryBackground: '#2C2C2E',

  // 聊天背景
  chatBackground: '#F2F2F7',
  darkChatBackground: '#000000',

  // 消息气泡颜色 - iOS 风格
  myMessageBubble: '#1DAC5A',
  otherMessageBubble: '#E5E5EA',
  darkMyMessageBubble: '#1DAC5A',
  darkOtherMessageBubble: '#3A3A3C',

  // 文本颜色 - iOS 风格
  lightPrimaryText: '#000000',
  darkPrimaryText: '#FFFFFF',
  lightSecondaryText: '#8E8E93',
  darkSecondaryText: '#8E8E93',
  lightTertiaryText: '#8E8E93',
  darkTertiaryText: '#8E8E93',

  // 分割线颜色
  lightSeparator: '#C6C6C8',
  darkSeparator: '#38383A',

  // 在线状态颜色
  onlineGreen: '#34C759',
  lastSeenGrey: '#8E8E93',

  // 通知和状态颜色
  unreadRed: '#FF3B30',
  typingGreen: '#1DAC5A',
  deliveredBlue: '#007AFF',
  readBlue: '#007AFF',
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary colors
  primaryGreen: string;
  primaryGreenDark: string;
  lightGreen: string;
  accentBlue: string;

  // iOS system colors
  iosBlue: string;
  iosGreen: string;
  iosRed: string;
  iosOrange: string;
  iosPurple: string;
  iosYellow: string;
  iosPink: string;
  iosTeal: string;

  // Background colors
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  chatBackground: string;

  // Message bubble colors
  myMessageBubble: string;
  otherMessageBubble: string;

  // Text colors
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;

  // Other colors
  separator: string;
  onlineColor: string;
  lastSeenGrey: string;
  unreadColor: string;
  typingGreen: string;
  deliveredColor: string;
  readColor: string;
}

export const lightThemeColors: ThemeColors = {
  primaryGreen: AppTheme.primaryGreen,
  primaryGreenDark: AppTheme.primaryGreenDark,
  lightGreen: AppTheme.lightGreen,
  accentBlue: AppTheme.accentBlue,
  iosBlue: AppTheme.iosBlue,
  iosGreen: AppTheme.iosGreen,
  iosRed: AppTheme.iosRed,
  iosOrange: AppTheme.iosOrange,
  iosPurple: AppTheme.iosPurple,
  iosYellow: AppTheme.iosYellow,
  iosPink: AppTheme.iosPink,
  iosTeal: AppTheme.iosTeal,
  background: AppTheme.lightBackground,
  secondaryBackground: AppTheme.lightSecondaryBackground,
  tertiaryBackground: AppTheme.lightTertiaryBackground,
  chatBackground: AppTheme.chatBackground,
  myMessageBubble: AppTheme.myMessageBubble,
  otherMessageBubble: AppTheme.otherMessageBubble,
  primaryText: AppTheme.lightPrimaryText,
  secondaryText: AppTheme.lightSecondaryText,
  tertiaryText: AppTheme.lightTertiaryText,
  separator: AppTheme.lightSeparator,
  onlineColor: AppTheme.onlineGreen,
  lastSeenGrey: AppTheme.lastSeenGrey,
  unreadColor: AppTheme.unreadRed,
  typingGreen: AppTheme.typingGreen,
  deliveredColor: AppTheme.deliveredBlue,
  readColor: AppTheme.readBlue,
};

export const darkThemeColors: ThemeColors = {
  primaryGreen: AppTheme.primaryGreen,
  primaryGreenDark: AppTheme.primaryGreenDark,
  lightGreen: AppTheme.lightGreen,
  accentBlue: AppTheme.accentBlue,
  iosBlue: AppTheme.iosBlue,
  iosGreen: AppTheme.iosGreen,
  iosRed: AppTheme.iosRed,
  iosOrange: AppTheme.iosOrange,
  iosPurple: AppTheme.iosPurple,
  iosYellow: AppTheme.iosYellow,
  iosPink: AppTheme.iosPink,
  iosTeal: AppTheme.iosTeal,
  background: AppTheme.darkBackground,
  secondaryBackground: AppTheme.darkSecondaryBackground,
  tertiaryBackground: AppTheme.darkTertiaryBackground,
  chatBackground: AppTheme.darkChatBackground,
  myMessageBubble: AppTheme.darkMyMessageBubble,
  otherMessageBubble: AppTheme.darkOtherMessageBubble,
  primaryText: AppTheme.darkPrimaryText,
  secondaryText: AppTheme.darkSecondaryText,
  tertiaryText: AppTheme.darkTertiaryText,
  separator: AppTheme.darkSeparator,
  onlineColor: AppTheme.onlineGreen,
  lastSeenGrey: AppTheme.lastSeenGrey,
  unreadColor: AppTheme.unreadRed,
  typingGreen: AppTheme.typingGreen,
  deliveredColor: AppTheme.deliveredBlue,
  readColor: AppTheme.readBlue,
};

export interface Typography {
  fontSize: {
    large: number;
    medium: number;
    small: number;
    xsmall: number;
  };
  fontWeight: {
    bold: string;
    semibold: string;
    medium: string;
    regular: string;
  };
  lineHeight: {
    large: number;
    medium: number;
    small: number;
  };
}

export const typography: Typography = {
  fontSize: {
    large: 34,
    medium: 17,
    small: 15,
    xsmall: 13,
  },
  fontWeight: {
    bold: '700',
    semibold: '600',
    medium: '500',
    regular: '400',
  },
  lineHeight: {
    large: 34,
    medium: 24,
    small: 20,
  },
};

