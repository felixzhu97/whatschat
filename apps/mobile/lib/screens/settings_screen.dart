import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:adaptive_theme/adaptive_theme.dart';
import '../themes/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('设置'),
        actions: [
          IconButton(
            icon: const Icon(FontAwesomeIcons.magnifyingGlass),
            onPressed: () {
              // 搜索设置
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('搜索设置功能待实现')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        children: [
          // 用户资料
          _buildUserProfile(),

          const Divider(),

          // 设置选项
          _buildSettingsSection('账户', [
            _buildSettingsTile(
              icon: FontAwesomeIcons.key,
              title: '隐私',
              subtitle: '最后上线时间、头像等',
              onTap: () => _showPrivacySettings(),
            ),
            _buildSettingsTile(
              icon: FontAwesomeIcons.shield,
              title: '安全',
              subtitle: '端到端加密、双重验证',
              onTap: () => _showSecuritySettings(),
            ),
            _buildSettingsTile(
              icon: FontAwesomeIcons.userGroup,
              title: '群组',
              subtitle: '谁可以添加我到群组',
              onTap: () => _showGroupSettings(),
            ),
            _buildSettingsTile(
              icon: FontAwesomeIcons.database,
              title: '存储和数据',
              subtitle: '网络使用、自动下载',
              onTap: () => _showStorageSettings(),
            ),
          ]),

          _buildSettingsSection('通知', [
            _buildSettingsTile(
              icon: FontAwesomeIcons.bell,
              title: '通知',
              subtitle: '消息、群组和通话提醒',
              onTap: () => _showNotificationSettings(),
            ),
          ]),

          _buildSettingsSection('聊天', [
            _buildSettingsTile(
              icon: FontAwesomeIcons.message,
              title: '聊天',
              subtitle: '主题、壁纸、聊天记录',
              onTap: () => _showChatSettings(),
            ),
            _buildSettingsTile(
              icon: FontAwesomeIcons.star,
              title: '星标消息',
              subtitle: '查看所有星标消息',
              onTap: () => _showStarredMessages(),
            ),
          ]),

          _buildSettingsSection('支持', [
            _buildSettingsTile(
              icon: FontAwesomeIcons.circleQuestion,
              title: '帮助',
              subtitle: '帮助中心、联系我们、隐私政策',
              onTap: () => _showHelp(),
            ),
            _buildSettingsTile(
              icon: FontAwesomeIcons.heart,
              title: '告诉朋友',
              subtitle: '分享 WhatsChat',
              onTap: () => _shareApp(),
            ),
          ]),

          _buildSettingsSection('关于', [
            _buildSettingsTile(
              icon: FontAwesomeIcons.info,
              title: '关于',
              subtitle: '版本信息',
              onTap: () => _showAbout(),
            ),
          ]),

          const SizedBox(height: 20),

          // 主题切换
          _buildThemeSelector(),

          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildUserProfile() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const CircleAvatar(
            backgroundColor: AppTheme.primaryGreen,
            radius: 30,
            child: Text(
              '我',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '我的用户名',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  '嗨，我正在使用 WhatsChat！',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.lightSecondaryText,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(FontAwesomeIcons.qrcode),
            onPressed: () => _showQRCode(),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> tiles) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppTheme.primaryGreen,
            ),
          ),
        ),
        ...tiles,
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.lightSecondaryText),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(FontAwesomeIcons.chevronRight, size: 16),
      onTap: onTap,
    );
  }

  Widget _buildThemeSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.lightSeparator),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              '主题',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(FontAwesomeIcons.sun),
            title: const Text('浅色主题'),
            trailing: Radio<AdaptiveThemeMode>(
              value: AdaptiveThemeMode.light,
              groupValue: AdaptiveTheme.of(context).mode,
              onChanged: (value) {
                AdaptiveTheme.of(context).setLight();
              },
            ),
          ),
          ListTile(
            leading: const Icon(FontAwesomeIcons.moon),
            title: const Text('深色主题'),
            trailing: Radio<AdaptiveThemeMode>(
              value: AdaptiveThemeMode.dark,
              groupValue: AdaptiveTheme.of(context).mode,
              onChanged: (value) {
                AdaptiveTheme.of(context).setDark();
              },
            ),
          ),
          ListTile(
            leading: const Icon(FontAwesomeIcons.circleHalfStroke),
            title: const Text('跟随系统'),
            trailing: Radio<AdaptiveThemeMode>(
              value: AdaptiveThemeMode.system,
              groupValue: AdaptiveTheme.of(context).mode,
              onChanged: (value) {
                AdaptiveTheme.of(context).setSystem();
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showQRCode() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('我的二维码'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              FontAwesomeIcons.qrcode,
              size: 100,
              color: AppTheme.primaryGreen,
            ),
            SizedBox(height: 16),
            Text('扫描二维码添加好友'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('关闭'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('分享二维码功能待实现')),
              );
            },
            child: const Text('分享'),
          ),
        ],
      ),
    );
  }

  void _showPrivacySettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('隐私设置功能待实现')),
    );
  }

  void _showSecuritySettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('安全设置功能待实现')),
    );
  }

  void _showGroupSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('群组设置功能待实现')),
    );
  }

  void _showStorageSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('存储设置功能待实现')),
    );
  }

  void _showNotificationSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('通知设置功能待实现')),
    );
  }

  void _showChatSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('聊天设置功能待实现')),
    );
  }

  void _showStarredMessages() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('星标消息功能待实现')),
    );
  }

  void _showHelp() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('帮助功能待实现')),
    );
  }

  void _shareApp() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('分享应用功能待实现')),
    );
  }

  void _showAbout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('关于 WhatsChat'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('版本: 1.0.0'),
            SizedBox(height: 8),
            Text('构建: 2024.01.01'),
            SizedBox(height: 8),
            Text('一个功能完整的 WhatsApp 克隆应用'),
            SizedBox(height: 8),
            Text('使用 Flutter 开发'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('关闭'),
          ),
        ],
      ),
    );
  }
}
