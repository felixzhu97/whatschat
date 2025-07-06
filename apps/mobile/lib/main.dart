import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:adaptive_theme/adaptive_theme.dart';
import 'themes/app_theme.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 获取保存的主题模式
  final savedThemeMode = await AdaptiveTheme.getThemeMode();
  
  runApp(WhatsChat(savedThemeMode: savedThemeMode));
}

class WhatsChat extends StatelessWidget {
  final AdaptiveThemeMode? savedThemeMode;
  
  const WhatsChat({super.key, this.savedThemeMode});

  @override
  Widget build(BuildContext context) {
    return AdaptiveTheme(
      light: AppTheme.lightTheme,
      dark: AppTheme.darkTheme,
      initial: savedThemeMode ?? AdaptiveThemeMode.system,
      builder: (theme, darkTheme) => CupertinoApp(
        title: 'WhatsChat',
        theme: _getCupertinoTheme(theme),
        debugShowCheckedModeBanner: false,
        home: const HomeScreen(),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('zh', 'CN'),
          Locale('en', 'US'),
        ],
      ),
    );
  }

  CupertinoThemeData _getCupertinoTheme(ThemeData materialTheme) {
    final isDark = materialTheme.brightness == Brightness.dark;
    
    return CupertinoThemeData(
      brightness: materialTheme.brightness,
      primaryColor: AppTheme.primaryGreen,
      scaffoldBackgroundColor: isDark 
          ? AppTheme.darkBackground 
          : AppTheme.lightBackground,
      barBackgroundColor: isDark 
          ? AppTheme.darkSecondaryBackground 
          : AppTheme.lightSecondaryBackground,
      primaryContrastingColor: isDark 
          ? AppTheme.darkPrimaryText 
          : AppTheme.lightPrimaryText,
      textTheme: CupertinoTextThemeData(
        primaryColor: isDark 
            ? AppTheme.darkPrimaryText 
            : AppTheme.lightPrimaryText,
        textStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkPrimaryText 
              : AppTheme.lightPrimaryText,
          fontFamily: '.SF Pro Text',
          fontSize: 17,
        ),
        navTitleTextStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkPrimaryText 
              : AppTheme.lightPrimaryText,
          fontFamily: '.SF Pro Display',
          fontSize: 17,
          fontWeight: FontWeight.w600,
        ),
        navLargeTitleTextStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkPrimaryText 
              : AppTheme.lightPrimaryText,
          fontFamily: '.SF Pro Display',
          fontSize: 34,
          fontWeight: FontWeight.w700,
        ),
        navActionTextStyle: const TextStyle(
          color: AppTheme.iosBlue,
          fontFamily: '.SF Pro Text',
          fontSize: 17,
        ),
        tabLabelTextStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkSecondaryText 
              : AppTheme.lightSecondaryText,
          fontFamily: '.SF Pro Text',
          fontSize: 10,
        ),
        actionTextStyle: const TextStyle(
          color: AppTheme.iosBlue,
          fontFamily: '.SF Pro Text',
          fontSize: 17,
        ),
        dateTimePickerTextStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkPrimaryText 
              : AppTheme.lightPrimaryText,
          fontFamily: '.SF Pro Text',
          fontSize: 21,
        ),
        pickerTextStyle: TextStyle(
          color: isDark 
              ? AppTheme.darkPrimaryText 
              : AppTheme.lightPrimaryText,
          fontFamily: '.SF Pro Text',
          fontSize: 21,
        ),
      ),
    );
  }
}
