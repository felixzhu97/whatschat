import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../themes/app_theme.dart';
import 'chat_list_screen.dart';
import 'status_screen.dart';
import 'calls_screen.dart';
import 'communities_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 3; // 默认选中 Chats

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
        activeColor: CupertinoColors.black,
        inactiveColor: CupertinoColors.systemGrey,
        iconSize: 26,
        height: 90,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.circle),
            label: 'Updates',
          ),
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.phone),
            label: 'Calls',
          ),
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.group),
            label: 'Communities',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              children: [
                const Icon(CupertinoIcons.chat_bubble_2),
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: const Text(
                      '1',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
            label: 'Chats',
          ),
          const BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.gear_alt),
            label: 'Settings',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0:
            return CupertinoTabView(
              builder: (context) => const StatusScreen(),
            );
          case 1:
            return CupertinoTabView(
              builder: (context) => const CallsScreen(),
            );
          case 2:
            return CupertinoTabView(
              builder: (context) => const CommunitiesScreen(),
            );
          case 3:
            return CupertinoTabView(
              builder: (context) => const ChatListScreen(),
            );
          case 4:
            return CupertinoTabView(
              builder: (context) => const SettingsScreen(),
            );
          default:
            return CupertinoTabView(
              builder: (context) => const SettingsScreen(),
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
