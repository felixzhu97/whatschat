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
        middle: Text('Settings'),
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
                    title: 'Avatar',
                    onTap: () => _openAvatar(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.list_bullet,
                    title: 'List',
                    onTap: () => _openList(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.speaker_3,
                    title: 'Broadcast messages',
                    onTap: () => _openBroadcast(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.star,
                    title: 'Starred messages',
                    onTap: () => _openStarred(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.device_laptop,
                    title: 'Linked devices',
                    onTap: () => _openLinkedDevices(),
                  ),

                  const SizedBox(height: 20),

                  _buildSettingsItem(
                    icon: CupertinoIcons.location,
                    title: 'Account',
                    onTap: () => _openAccount(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.lock,
                    title: 'Privacy',
                    onTap: () => _openPrivacy(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.chat_bubble,
                    title: 'Chats',
                    onTap: () => _openChats(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.bell,
                    title: 'Notifications',
                    onTap: () => _openNotifications(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.arrow_up_arrow_down,
                    title: 'Storage and data',
                    onTap: () => _openStorage(),
                  ),

                  const SizedBox(height: 20),

                  _buildSettingsItem(
                    icon: CupertinoIcons.info,
                    title: 'Help',
                    onTap: () => _openHelp(),
                  ),
                  _buildSettingsItem(
                    icon: CupertinoIcons.heart,
                    title: 'Invite a friend',
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
        placeholder: 'Search',
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
            'Also from Meta',
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
          title: 'Open Instagram',
          onTap: () => _openInstagram(),
        ),
        _buildMetaItem(
          icon: CupertinoIcons.f_cursive,
          title: 'Open Facebook',
          onTap: () => _openFacebook(),
        ),
        _buildMetaItem(
          icon: CupertinoIcons.at,
          title: 'Open Threads',
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
        title: const Text('QR Code'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openAvatar() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Avatar'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openList() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('List'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openBroadcast() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Broadcast Messages'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openStarred() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Starred Messages'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openLinkedDevices() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Linked Devices'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openAccount() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Account'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openPrivacy() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Privacy'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openChats() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Chats'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openNotifications() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Notifications'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openStorage() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Storage and Data'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openHelp() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Help'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _inviteFriend() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Invite a Friend'),
        content: const Text('This feature is coming soon!'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openInstagram() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Open Instagram'),
        content: const Text('This would open Instagram app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openFacebook() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Open Facebook'),
        content: const Text('This would open Facebook app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openThreads() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Open Threads'),
        content: const Text('This would open Threads app if installed.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
