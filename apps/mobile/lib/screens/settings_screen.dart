import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import '../themes/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('设置'),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Search bar
            _buildSearchBar(),

            Expanded(
              child: ListView(
                children: [
                  // User profile
                  _buildUserProfile(),

                  // Settings items
                  _buildSettingsItem(
                    icon: CupertinoIcons.person_circle,
                    title: '头像',
                    onTap: () => _openAvatar(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.list_bullet,
                    title: '列表',
                    onTap: () => _openList(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.speaker_3,
                    title: '广播消息',
                    onTap: () => _openBroadcast(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.star,
                    title: '收藏消息',
                    onTap: () => _openStarred(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.device_laptop,
                    title: '关联设备',
                    onTap: () => _openLinkedDevices(),
                  ),

                  const SizedBox(height: 20),

                  _buildSettingsItem(
                    icon: CupertinoIcons.location,
                    title: '账户',
                    onTap: () => _openAccount(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.lock,
                    title: '隐私',
                    onTap: () => _openPrivacy(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.chat_bubble,
                    title: '聊天',
                    onTap: () => _openChats(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.bell,
                    title: '通知',
                    onTap: () => _openNotifications(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.arrow_up_arrow_down,
                    title: '存储和数据',
                    onTap: () => _openStorage(),
                  ),

                  const SizedBox(height: 20),

                  _buildSettingsItem(
                    icon: CupertinoIcons.info,
                    title: '帮助',
                    onTap: () => _openHelp(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.heart,
                    title: '邀请朋友',
                    onTap: () => _inviteFriend(),
                  ),

                  const SizedBox(height: 30),

                  // Also from Meta section
                  _buildMetaSection(),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: CupertinoSearchTextField(
        controller: _searchController,
        placeholder: '搜索',
        style: CupertinoTheme.of(context).textTheme.textStyle,
      ),
    );
  }

  Widget _buildUserProfile() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 60,
            height: 60,
            decoration: const BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                'M',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),

          // User info
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Marty McFly',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: CupertinoColors.black,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Nobody calls me chicken! 🔥',
                  style: TextStyle(
                    fontSize: 14,
                    color: CupertinoColors.systemGrey,
                  ),
                ),
              ],
            ),
          ),

          // QR code button
          CupertinoButton(
            padding: EdgeInsets.zero,
            onPressed: () => _showQRCode(),
            child: Container(
              width: 24,
              height: 24,
              child: const Icon(
                CupertinoIcons.qrcode,
                color: CupertinoColors.systemGrey,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: CupertinoListTile(
        leading: Icon(
          icon,
          color: CupertinoColors.systemGrey,
          size: 22,
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            color: CupertinoColors.black,
            height: 2.5,
          ),
        ),
        trailing: const Icon(
          CupertinoIcons.chevron_forward,
          color: CupertinoColors.systemGrey2,
          size: 16,
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildMetaSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Meta',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: CupertinoColors.systemGrey,
            ),
          ),
        ),
        const SizedBox(height: 8),
        _buildMetaItem(
          icon: CupertinoIcons.camera,
          title: '打开Instagram',
          onTap: () => _openInstagram(),
        ),
        _buildMetaItem(
          icon: CupertinoIcons.f_cursive,
          title: '打开Facebook',
          onTap: () => _openFacebook(),
        ),
        _buildMetaItem(
          icon: CupertinoIcons.at,
          title: '打开Threads',
          onTap: () => _openThreads(),
        ),
      ],
    );
  }

  Widget _buildMetaItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: CupertinoListTile(
        leading: Icon(
          icon,
          color: CupertinoColors.systemGrey,
          size: 22,
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            color: CupertinoColors.black,
          ),
        ),
        trailing: const Icon(
          CupertinoIcons.chevron_forward,
          color: CupertinoColors.systemGrey2,
          size: 16,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showQRCode() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('二维码'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openAvatar() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('头像'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openList() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('列表'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openBroadcast() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('广播消息'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openStarred() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('收藏消息'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openLinkedDevices() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('关联设备'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openAccount() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('账户'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openPrivacy() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('隐私'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openChats() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('聊天'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openNotifications() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('通知'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openStorage() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('存储和数据'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openHelp() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('帮助'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _inviteFriend() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('邀请朋友'),
        content: const Text('这个功能即将推出！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openInstagram() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('打开Instagram'),
        content: const Text('This would open Instagram app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openFacebook() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('打开Facebook'),
        content: const Text('This would open Facebook app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _openThreads() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('打开Threads'),
        content: const Text('This would open Threads app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }
}
