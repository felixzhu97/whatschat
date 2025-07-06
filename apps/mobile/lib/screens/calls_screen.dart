import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import '../themes/app_theme.dart';

class CallsScreen extends StatefulWidget {
  const CallsScreen({super.key});

  @override
  State<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends State<CallsScreen> {
  List<Map<String, dynamic>> _recentCalls = [];

  @override
  void initState() {
    super.initState();
    _loadRecentCalls();
  }

  void _loadRecentCalls() {
    _recentCalls = [
      {
        'name': 'Daddy',
        'type': 'Outgoing',
        'time': '14:01',
        'avatarColor': Colors.blue,
        'isMissed': false,
      },
      {
        'name': 'Daddy',
        'type': 'Missed',
        'time': '14:00',
        'avatarColor': Colors.blue,
        'isMissed': true,
      },
      {
        'name': 'Daddy',
        'type': 'Outgoing',
        'time': 'Yesterday',
        'avatarColor': Colors.blue,
        'isMissed': false,
      },
      {
        'name': 'Jenny',
        'type': 'Outgoing',
        'time': '15/10/85',
        'avatarColor': Colors.pink,
        'isMissed': false,
        'hasHeart': true,
      },
      {
        'name': 'Jenny',
        'type': 'Missed',
        'time': '11/10/85',
        'avatarColor': Colors.pink,
        'isMissed': true,
        'hasHeart': true,
      },
      {
        'name': 'Emmett "Doc" Brown',
        'type': 'Outgoing',
        'time': '02/09/85',
        'avatarColor': Colors.indigo,
        'isMissed': false,
      },
    ];
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showMoreOptions(),
          child: const Icon(CupertinoIcons.ellipsis),
        ),
        middle: const Text('通话'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showNewCallOptions(),
          child: Container(
            width: 28,
            height: 28,
            decoration: const BoxDecoration(
              color: AppTheme.primaryGreen,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              CupertinoIcons.plus,
              color: Colors.white,
              size: 18,
            ),
          ),
        ),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Favourites Section
            _buildFavouritesSection(),

            // Recent Section
            Expanded(
              child: _buildRecentSection(),
            ),

            // Encryption Notice
            _buildEncryptionNotice(),
          ],
        ),
      ),
    );
  }

  Widget _buildFavouritesSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '收藏',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: CupertinoColors.black,
            ),
          ),
          const SizedBox(height: 16),

          // Add favourite
          GestureDetector(
            onTap: () => _addFavourite(),
            child: const Row(
              children: [
                Icon(
                  CupertinoIcons.plus,
                  color: CupertinoColors.systemGrey,
                  size: 20,
                ),
                SizedBox(width: 12),
                Text(
                  '添加收藏',
                  style: TextStyle(
                    fontSize: 16,
                    color: CupertinoColors.black,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '最近',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: CupertinoColors.black,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: _recentCalls.length,
              itemBuilder: (context, index) {
                final call = _recentCalls[index];
                return _buildCallTile(call);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallTile(Map<String, dynamic> call) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: call['avatarColor'],
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                call['name'][0].toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Call info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        call['name'],
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: call['isMissed']
                              ? Colors.red
                              : CupertinoColors.black,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (call['hasHeart'] == true) ...[
                      const SizedBox(width: 4),
                      const Text(
                        '❤️',
                        style: TextStyle(fontSize: 14),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(
                      call['type'] == 'Outgoing'
                          ? CupertinoIcons.phone_arrow_up_right
                          : CupertinoIcons.phone_arrow_down_left,
                      size: 14,
                      color: call['isMissed']
                          ? Colors.red
                          : CupertinoColors.systemGrey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      call['type'],
                      style: TextStyle(
                        fontSize: 14,
                        color: call['isMissed']
                            ? Colors.red
                            : CupertinoColors.systemGrey,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Time and info button
          Row(
            children: [
              Text(
                call['time'],
                style: const TextStyle(
                  fontSize: 14,
                  color: CupertinoColors.systemGrey,
                ),
              ),
              const SizedBox(width: 8),
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _showCallInfo(call),
                child: const Icon(
                  CupertinoIcons.info,
                  color: CupertinoColors.systemGrey,
                  size: 20,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEncryptionNotice() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            CupertinoIcons.lock_shield,
            size: 14,
            color: CupertinoColors.systemGrey2,
          ),
          const SizedBox(width: 8),
          RichText(
            text: const TextSpan(
              style: TextStyle(
                fontSize: 13,
                color: CupertinoColors.systemGrey2,
              ),
              children: [
                TextSpan(text: 'Your personal calls are '),
                TextSpan(
                  text: 'end-to-end encrypted',
                  style: TextStyle(color: AppTheme.primaryGreen),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showMoreOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Clear call log
            },
            child: const Text('清除通话记录'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Call settings
            },
            child: const Text('通话设置'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _showNewCallOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('新通话'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // New voice call
            },
            child: const Text('新语音通话'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // New video call
            },
            child: const Text('新视频通话'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // New group call
            },
            child: const Text('新群组通话'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _addFavourite() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('添加收藏'),
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

  void _showCallInfo(Map<String, dynamic> call) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text('${call['name']} - ${call['type']}'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Call back
            },
            child: const Text('回拨'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Video call
            },
            child: const Text('视频通话'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Remove from call log
            },
            child: const Text('从通话记录中删除'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }
}
