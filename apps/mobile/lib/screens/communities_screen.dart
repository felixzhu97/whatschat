import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../themes/app_theme.dart';

class CommunitiesScreen extends StatelessWidget {
  const CommunitiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        backgroundColor: CupertinoColors.systemBackground,
        border: null,
        leading: const SizedBox.shrink(),
        middle: const Text(
          'Communities',
          style: TextStyle(
            fontSize: 34,
            fontWeight: FontWeight.bold,
            color: CupertinoColors.black,
          ),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showNewCommunityOptions(context),
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
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
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // 插图
              _buildIllustration(),
              const SizedBox(height: 32),

              // 标题
              const Text(
                'Stay connected with a community',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: CupertinoColors.black,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // 描述文本
              const Text(
                'Communities bring members together in topic-based groups. Any community you\'re added to will appear here.',
                style: TextStyle(
                  fontSize: 14,
                  color: CupertinoColors.systemGrey,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),

              // 示例链接
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _showExampleCommunities(context),
                child: const Text(
                  'See example communities',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.primaryGreen,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 48),

              // 新建社区按钮
              SizedBox(
                width: double.infinity,
                child: CupertinoButton(
                  color: AppTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(12),
                  onPressed: () => _createNewCommunity(context),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        CupertinoIcons.plus,
                        color: Colors.white,
                        size: 18,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'New Community',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIllustration() {
    return Container(
      width: 200,
      height: 160,
      decoration: BoxDecoration(
        color: const Color(0xFFF0F8F0),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        children: [
          // 背景形状
          Positioned(
            top: 20,
            right: 20,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2E0),
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),

          // 人群图标
          Positioned(
            top: 40,
            left: 30,
            child: Container(
              width: 50,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                CupertinoIcons.group_solid,
                color: Colors.white,
                size: 24,
              ),
            ),
          ),

          // 编辑图标
          Positioned(
            top: 60,
            right: 40,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: CupertinoColors.systemGrey4),
              ),
              child: const Icon(
                CupertinoIcons.pencil,
                color: CupertinoColors.systemGrey,
                size: 20,
              ),
            ),
          ),

          // 加号图标
          Positioned(
            bottom: 40,
            right: 30,
            child: Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen,
                borderRadius: BorderRadius.circular(15),
              ),
              child: const Icon(
                CupertinoIcons.plus,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),

          // 聊天气泡
          Positioned(
            bottom: 30,
            left: 40,
            child: Container(
              width: 35,
              height: 25,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CupertinoColors.systemGrey4),
              ),
              child: const Center(
                child: Text(
                  '💬',
                  style: TextStyle(fontSize: 12),
                ),
              ),
            ),
          ),

          // 装饰圆点
          Positioned(
            top: 30,
            right: 70,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
            ),
          ),

          // 装饰线条
          Positioned(
            bottom: 50,
            left: 20,
            child: Container(
              width: 20,
              height: 2,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.5),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showNewCommunityOptions(BuildContext context) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Create Community'),
        message: const Text('Choose how to create your community'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Create from scratch'),
          ),
          CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Use template'),
          ),
          CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Import from group'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _showExampleCommunities(BuildContext context) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Example Communities'),
        content: const Text(
          'Here are some popular community types:\n\n'
          '• Study Groups\n'
          '• Sports Teams\n'
          '• Hobby Clubs\n'
          '• Work Teams\n'
          '• Family Groups\n'
          '• Local Neighborhoods',
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _createNewCommunity(BuildContext context) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Create Community'),
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
}
