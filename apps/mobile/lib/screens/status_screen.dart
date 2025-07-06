import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../themes/app_theme.dart';
import '../models/models.dart';

class StatusScreen extends StatefulWidget {
  const StatusScreen({super.key});

  @override
  State<StatusScreen> createState() => _StatusScreenState();
}

class _StatusScreenState extends State<StatusScreen> {
  List<Status> _statuses = [];
  List<Status> _myStatuses = [];

  @override
  void initState() {
    super.initState();
    _loadStatuses();
  }

  void _loadStatuses() {
    // 模拟状态数据
    _statuses = [
      Status(
        id: '1',
        userId: 'user2',
        userName: '张三',
        content: '今天天气真好！',
        type: StatusType.text,
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        expiresAt: DateTime.now().add(const Duration(hours: 23)),
        viewers: [],
      ),
      Status(
        id: '2',
        userId: 'user3',
        userName: '李四',
        content: 'https://picsum.photos/400/600',
        type: StatusType.image,
        mediaUrl: 'https://picsum.photos/400/600',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        expiresAt: DateTime.now().add(const Duration(hours: 22)),
        viewers: [],
      ),
      Status(
        id: '3',
        userId: 'user4',
        userName: '王五',
        content:
            'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        type: StatusType.video,
        mediaUrl:
            'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnailUrl: 'https://picsum.photos/400/600',
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
        expiresAt: DateTime.now().add(const Duration(hours: 21)),
        viewers: ['user1'],
      ),
    ];

    _myStatuses = [
      Status(
        id: 'my1',
        userId: 'user1',
        userName: '我',
        content: '工作中...',
        type: StatusType.text,
        timestamp: DateTime.now().subtract(const Duration(hours: 4)),
        expiresAt: DateTime.now().add(const Duration(hours: 20)),
        viewers: ['user2', 'user3'],
      ),
    ];

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('状态'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => _createStatus(),
              child: const Icon(CupertinoIcons.camera_fill),
            ),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => _showStatusOptions(),
              child: const Icon(CupertinoIcons.ellipsis),
            ),
          ],
        ),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: CustomScrollView(
          slivers: [
            // 我的状态
            SliverToBoxAdapter(
              child: _buildMyStatusSection(),
            ),

            // 分割线
            const SliverToBoxAdapter(
              child: Divider(height: 1),
            ),

            // 最近更新
            if (_statuses.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  child: const Text(
                    '最近更新',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: CupertinoColors.systemGrey,
                    ),
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final status = _statuses[index];
                    return _buildStatusTile(status);
                  },
                  childCount: _statuses.length,
                ),
              ),
            ],

            // 已查看的状态
            if (_getViewedStatuses().isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  child: const Text(
                    '已查看的状态',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: CupertinoColors.systemGrey,
                    ),
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final status = _getViewedStatuses()[index];
                    return _buildStatusTile(status);
                  },
                  childCount: _getViewedStatuses().length,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMyStatusSection() {
    return Container(
      decoration: BoxDecoration(
        color: CupertinoTheme.of(context).scaffoldBackgroundColor,
        border: const Border(
          bottom: BorderSide(
            color: CupertinoColors.separator,
            width: 0.5,
          ),
        ),
      ),
      child: CupertinoListTile(
        leading: Stack(
          children: [
            const CircleAvatar(
              backgroundColor: AppTheme.primaryGreen,
              radius: 25,
              child: Text(
                '我',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: AppTheme.primaryGreen,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  CupertinoIcons.plus,
                  color: Colors.white,
                  size: 12,
                ),
              ),
            ),
          ],
        ),
        title: const Text(
          '我的状态',
          style: TextStyle(
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Text(
          _myStatuses.isNotEmpty ? '点击查看或更新状态' : '点击分享状态更新',
          style: const TextStyle(
            color: CupertinoColors.systemGrey,
            fontSize: 13,
          ),
        ),
        onTap: () {
          if (_myStatuses.isNotEmpty) {
            _viewMyStatuses();
          } else {
            _createStatus();
          }
        },
      ),
    );
  }

  Widget _buildStatusTile(Status status) {
    final isViewed = status.viewers.contains('user1');

    return Container(
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: CupertinoColors.separator,
            width: 0.5,
          ),
        ),
      ),
      child: CupertinoListTile(
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color:
                  isViewed ? CupertinoColors.systemGrey : AppTheme.primaryGreen,
              width: 2,
            ),
          ),
          child: CircleAvatar(
            backgroundColor: AppTheme.primaryGreen,
            radius: 23,
            child: Text(
              status.userName[0].toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        title: Text(
          status.userName,
          style: const TextStyle(
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Text(
          _formatTime(status.timestamp),
          style: const TextStyle(
            color: CupertinoColors.systemGrey,
            fontSize: 13,
          ),
        ),
        trailing:
            status.type == StatusType.image || status.type == StatusType.video
                ? Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: CupertinoColors.systemGrey6,
                    ),
                    child: status.type == StatusType.image
                        ? const Icon(
                            CupertinoIcons.photo,
                            color: CupertinoColors.systemGrey,
                            size: 20,
                          )
                        : const Icon(
                            CupertinoIcons.videocam_fill,
                            color: CupertinoColors.systemGrey,
                            size: 20,
                          ),
                  )
                : null,
        onTap: () => _viewStatus(status),
      ),
    );
  }

  List<Status> _getViewedStatuses() {
    return _statuses
        .where((status) => status.viewers.contains('user1'))
        .toList();
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inHours < 1) {
      return '${difference.inMinutes}分钟前';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}小时前';
    } else {
      return '${difference.inDays}天前';
    }
  }

  void _viewStatus(Status status) {
    // 标记为已查看
    if (!status.viewers.contains('user1')) {
      setState(() {
        status.viewers.add('user1');
      });
    }

    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: Text(status.userName),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_formatTime(status.timestamp)),
            const SizedBox(height: 8),
            Text(status.content),
          ],
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('关闭'),
          ),
          CupertinoDialogAction(
            onPressed: () {
              Navigator.pop(context);
              _replyToStatus(status);
            },
            child: const Text('回复'),
          ),
        ],
      ),
    );
  }

  void _viewMyStatuses() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('我的状态'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: _myStatuses
              .map((status) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Text(status.content),
                  ))
              .toList(),
        ),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('关闭'),
          ),
          CupertinoDialogAction(
            onPressed: () {
              Navigator.pop(context);
              _createStatus();
            },
            child: const Text('添加新状态'),
          ),
        ],
      ),
    );
  }

  void _createStatus() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('创建状态'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _createTextStatus();
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.textformat),
                SizedBox(width: 8),
                Text('文字状态'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _takePhoto();
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.camera_fill),
                SizedBox(width: 8),
                Text('拍照'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _pickFromGallery();
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.photo_fill),
                SizedBox(width: 8),
                Text('从相册选择'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _recordVideo();
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.videocam_fill),
                SizedBox(width: 8),
                Text('录制视频'),
              ],
            ),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _showStatusOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('状态选项'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _showComingSoon('状态隐私设置');
            },
            child: const Text('状态隐私'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _showComingSoon('阅后即焚消息');
            },
            child: const Text('阅后即焚消息'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _createTextStatus() {
    _showComingSoon('创建文字状态');
  }

  void _takePhoto() {
    _showComingSoon('拍照');
  }

  void _pickFromGallery() {
    _showComingSoon('从相册选择');
  }

  void _recordVideo() {
    _showComingSoon('录制视频');
  }

  void _replyToStatus(Status status) {
    _showComingSoon('回复状态');
  }

  void _showComingSoon(String feature) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('功能待实现'),
        content: Text('$feature功能正在开发中，敬请期待！'),
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
