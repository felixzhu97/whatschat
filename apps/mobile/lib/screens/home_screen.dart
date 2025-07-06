import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../themes/app_theme.dart';
import 'chat_list_screen.dart';
import 'status_screen.dart';
import 'calls_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      tabBar: CupertinoTabBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
        activeColor: AppTheme.iosBlue,
        inactiveColor: CupertinoColors.systemGrey,
        iconSize: 24,
        height: 85,
        items: const [
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.message),
            label: '聊天',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.camera),
            label: '状态',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.phone),
            label: '通话',
          ),
          BottomNavigationBarItem(
            icon: FaIcon(FontAwesomeIcons.gear),
            label: '设置',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0:
            return CupertinoTabView(
              builder: (context) => const ChatListScreen(),
            );
          case 1:
            return CupertinoTabView(
              builder: (context) => const StatusScreen(),
            );
          case 2:
            return CupertinoTabView(
              builder: (context) => const CallsScreen(),
            );
          case 3:
            return CupertinoTabView(
              builder: (context) => const SettingsScreen(),
            );
          default:
            return CupertinoTabView(
              builder: (context) => const ChatListScreen(),
            );
        }
      },
    );
  }

  void _showNewChatOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(FontAwesomeIcons.userPlus),
              title: const Text('新建聊天'),
              onTap: () {
                Navigator.pop(context);
                // 跳转到联系人选择页面
              },
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.userGroup),
              title: const Text('新建群组'),
              onTap: () {
                Navigator.pop(context);
                // 跳转到群组创建页面
              },
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.bullhorn),
              title: const Text('新建频道'),
              onTap: () {
                Navigator.pop(context);
                // 跳转到频道创建页面
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showNewStatusOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(FontAwesomeIcons.font),
              title: const Text('文字状态'),
              onTap: () {
                Navigator.pop(context);
                // 跳转到文字状态编辑页面
              },
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.camera),
              title: const Text('拍照'),
              onTap: () {
                Navigator.pop(context);
                // 打开相机拍照
              },
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.image),
              title: const Text('从相册选择'),
              onTap: () {
                Navigator.pop(context);
                // 打开相册选择
              },
            ),
          ],
        ),
      ),
    );
  }
} 