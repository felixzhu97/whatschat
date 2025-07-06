import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';

class AppTheme {
  // WhatsApp iOS 主色调
  static const Color primaryGreen = Color(0xFF1DAC5A);
  static const Color primaryGreenDark = Color(0xFF128C7E);
  static const Color lightGreen = Color(0xFF25D366);
  static const Color accentBlue = Color(0xFF007AFF);

  // iOS 系统颜色
  static const Color iosBlue = Color(0xFF007AFF);
  static const Color iosGreen = Color(0xFF34C759);
  static const Color iosRed = Color(0xFFFF3B30);
  static const Color iosOrange = Color(0xFFFF9500);
  static const Color iosPurple = Color(0xFFAF52DE);
  static const Color iosYellow = Color(0xFFFFCC00);
  static const Color iosPink = Color(0xFFFF2D92);
  static const Color iosTeal = Color(0xFF5AC8FA);

  // 背景色 - iOS 风格
  static const Color lightBackground = Color(0xFFF2F2F7);
  static const Color darkBackground = Color(0xFF000000);
  static const Color lightSecondaryBackground = Color(0xFFFFFFFF);
  static const Color darkSecondaryBackground = Color(0xFF1C1C1E);
  static const Color lightTertiaryBackground = Color(0xFFF2F2F7);
  static const Color darkTertiaryBackground = Color(0xFF2C2C2E);

  // 聊天背景
  static const Color chatBackground = Color(0xFFF2F2F7);
  static const Color darkChatBackground = Color(0xFF000000);

  // 消息气泡颜色 - iOS 风格
  static const Color myMessageBubble = Color(0xFF1DAC5A);
  static const Color otherMessageBubble = Color(0xFFE5E5EA);
  static const Color darkMyMessageBubble = Color(0xFF1DAC5A);
  static const Color darkOtherMessageBubble = Color(0xFF3A3A3C);

  // 文本颜色 - iOS 风格
  static const Color lightPrimaryText = Color(0xFF000000);
  static const Color darkPrimaryText = Color(0xFFFFFFFF);
  static const Color lightSecondaryText = Color(0xFF8E8E93);
  static const Color darkSecondaryText = Color(0xFF8E8E93);
  static const Color lightTertiaryText = Color(0xFF8E8E93);
  static const Color darkTertiaryText = Color(0xFF8E8E93);

  // 分割线颜色
  static const Color lightSeparator = Color(0xFFC6C6C8);
  static const Color darkSeparator = Color(0xFF38383A);

  // 在线状态颜色
  static const Color onlineGreen = Color(0xFF34C759);
  static const Color lastSeenGrey = Color(0xFF8E8E93);

  // 通知和状态颜色
  static const Color unreadRed = Color(0xFFFF3B30);
  static const Color typingGreen = Color(0xFF1DAC5A);
  static const Color deliveredBlue = Color(0xFF007AFF);
  static const Color readBlue = Color(0xFF007AFF);

  // iOS 风格的 Cupertino 主题
  static CupertinoThemeData lightCupertinoTheme = const CupertinoThemeData(
    brightness: Brightness.light,
    primaryColor: primaryGreen,
    scaffoldBackgroundColor: lightBackground,
    barBackgroundColor: lightSecondaryBackground,
    primaryContrastingColor: lightPrimaryText,
    textTheme: CupertinoTextThemeData(
      primaryColor: lightPrimaryText,
      textStyle: TextStyle(
        color: lightPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      navTitleTextStyle: TextStyle(
        color: lightPrimaryText,
        fontFamily: '.SF Pro Display',
        fontSize: 17,
        fontWeight: FontWeight.w600,
      ),
      navLargeTitleTextStyle: TextStyle(
        color: lightPrimaryText,
        fontFamily: '.SF Pro Display',
        fontSize: 34,
        fontWeight: FontWeight.w700,
      ),
      navActionTextStyle: TextStyle(
        color: iosBlue,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      tabLabelTextStyle: TextStyle(
        color: lightSecondaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 10,
      ),
      actionTextStyle: TextStyle(
        color: iosBlue,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      dateTimePickerTextStyle: TextStyle(
        color: lightPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 21,
      ),
      pickerTextStyle: TextStyle(
        color: lightPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 21,
      ),
    ),
  );

  static CupertinoThemeData darkCupertinoTheme = const CupertinoThemeData(
    brightness: Brightness.dark,
    primaryColor: primaryGreen,
    scaffoldBackgroundColor: darkBackground,
    barBackgroundColor: darkSecondaryBackground,
    primaryContrastingColor: darkPrimaryText,
    textTheme: CupertinoTextThemeData(
      primaryColor: darkPrimaryText,
      textStyle: TextStyle(
        color: darkPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      navTitleTextStyle: TextStyle(
        color: darkPrimaryText,
        fontFamily: '.SF Pro Display',
        fontSize: 17,
        fontWeight: FontWeight.w600,
      ),
      navLargeTitleTextStyle: TextStyle(
        color: darkPrimaryText,
        fontFamily: '.SF Pro Display',
        fontSize: 34,
        fontWeight: FontWeight.w700,
      ),
      navActionTextStyle: TextStyle(
        color: iosBlue,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      tabLabelTextStyle: TextStyle(
        color: darkSecondaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 10,
      ),
      actionTextStyle: TextStyle(
        color: iosBlue,
        fontFamily: '.SF Pro Text',
        fontSize: 17,
      ),
      dateTimePickerTextStyle: TextStyle(
        color: darkPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 21,
      ),
      pickerTextStyle: TextStyle(
        color: darkPrimaryText,
        fontFamily: '.SF Pro Text',
        fontSize: 21,
      ),
    ),
  );

  // Material 主题（备用）
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primaryGreen,
    scaffoldBackgroundColor: lightBackground,
    appBarTheme: const AppBarTheme(
      backgroundColor: lightSecondaryBackground,
      foregroundColor: lightPrimaryText,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: lightPrimaryText,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: const CardThemeData(
      color: lightSecondaryBackground,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
    ),
    listTileTheme: ListTileThemeData(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      dense: false,
      textColor: lightPrimaryText,
      iconColor: lightPrimaryText,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: lightSecondaryBackground,
      selectedItemColor: iosBlue,
      unselectedItemColor: lightSecondaryText,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        color: lightPrimaryText,
        fontSize: 32,
        fontWeight: FontWeight.w700,
      ),
      headlineMedium: TextStyle(
        color: lightPrimaryText,
        fontSize: 24,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: TextStyle(
        color: lightPrimaryText,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
      titleMedium: TextStyle(
        color: lightPrimaryText,
        fontSize: 17,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: TextStyle(
        color: lightPrimaryText,
        fontSize: 17,
      ),
      bodyMedium: TextStyle(
        color: lightPrimaryText,
        fontSize: 15,
      ),
      bodySmall: TextStyle(
        color: lightSecondaryText,
        fontSize: 13,
      ),
      labelLarge: TextStyle(
        color: iosBlue,
        fontSize: 17,
        fontWeight: FontWeight.w500,
      ),
    ),
    dividerColor: lightSeparator,
    colorScheme: const ColorScheme.light(
      primary: primaryGreen,
      secondary: iosBlue,
      surface: lightSecondaryBackground,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: lightPrimaryText,
      background: lightBackground,
      onBackground: lightPrimaryText,
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: primaryGreen,
    scaffoldBackgroundColor: darkBackground,
    appBarTheme: const AppBarTheme(
      backgroundColor: darkSecondaryBackground,
      foregroundColor: darkPrimaryText,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: darkPrimaryText,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: const CardThemeData(
      color: darkSecondaryBackground,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
    ),
    listTileTheme: ListTileThemeData(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      dense: false,
      textColor: darkPrimaryText,
      iconColor: darkPrimaryText,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: darkSecondaryBackground,
      selectedItemColor: iosBlue,
      unselectedItemColor: darkSecondaryText,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        color: darkPrimaryText,
        fontSize: 32,
        fontWeight: FontWeight.w700,
      ),
      headlineMedium: TextStyle(
        color: darkPrimaryText,
        fontSize: 24,
        fontWeight: FontWeight.w600,
      ),
      titleLarge: TextStyle(
        color: darkPrimaryText,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
      titleMedium: TextStyle(
        color: darkPrimaryText,
        fontSize: 17,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: TextStyle(
        color: darkPrimaryText,
        fontSize: 17,
      ),
      bodyMedium: TextStyle(
        color: darkPrimaryText,
        fontSize: 15,
      ),
      bodySmall: TextStyle(
        color: darkSecondaryText,
        fontSize: 13,
      ),
      labelLarge: TextStyle(
        color: iosBlue,
        fontSize: 17,
        fontWeight: FontWeight.w500,
      ),
    ),
    dividerColor: darkSeparator,
    colorScheme: const ColorScheme.dark(
      primary: primaryGreen,
      secondary: iosBlue,
      surface: darkSecondaryBackground,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: darkPrimaryText,
      background: darkBackground,
      onBackground: darkPrimaryText,
    ),
  );
}

// 自定义颜色扩展
extension CustomColors on ColorScheme {
  Color get messageBackground => brightness == Brightness.light
      ? AppTheme.myMessageBubble
      : AppTheme.darkMyMessageBubble;

  Color get otherMessageBackground => brightness == Brightness.light
      ? AppTheme.otherMessageBubble
      : AppTheme.darkOtherMessageBubble;

  Color get chatBackground => brightness == Brightness.light
      ? AppTheme.chatBackground
      : AppTheme.darkChatBackground;

  Color get secondaryText => brightness == Brightness.light
      ? AppTheme.lightSecondaryText
      : AppTheme.darkSecondaryText;

  Color get tertiaryText => brightness == Brightness.light
      ? AppTheme.lightTertiaryText
      : AppTheme.darkTertiaryText;

  Color get separator => brightness == Brightness.light
      ? AppTheme.lightSeparator
      : AppTheme.darkSeparator;

  Color get onlineColor => AppTheme.onlineGreen;
  Color get unreadColor => AppTheme.unreadRed;
  Color get deliveredColor => AppTheme.deliveredBlue;
  Color get readColor => AppTheme.readBlue;
  Color get iosBlue => AppTheme.iosBlue;
  Color get iosGreen => AppTheme.iosGreen;
  Color get iosRed => AppTheme.iosRed;
}

// Cupertino 颜色扩展
extension CupertinoCustomColors on CupertinoThemeData {
  Color get messageBackground => brightness == Brightness.light
      ? AppTheme.myMessageBubble
      : AppTheme.darkMyMessageBubble;

  Color get otherMessageBackground => brightness == Brightness.light
      ? AppTheme.otherMessageBubble
      : AppTheme.darkOtherMessageBubble;

  Color get chatBackground => brightness == Brightness.light
      ? AppTheme.chatBackground
      : AppTheme.darkChatBackground;

  Color get secondaryText => brightness == Brightness.light
      ? AppTheme.lightSecondaryText
      : AppTheme.darkSecondaryText;

  Color get separator => brightness == Brightness.light
      ? AppTheme.lightSeparator
      : AppTheme.darkSeparator;

  Color get onlineColor => AppTheme.onlineGreen;
  Color get unreadColor => AppTheme.unreadRed;
  Color get deliveredColor => AppTheme.deliveredBlue;
  Color get readColor => AppTheme.readBlue;
}
