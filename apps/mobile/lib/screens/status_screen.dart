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
  List<Map<String, dynamic>> _recentUpdates = [];

  @override
  void initState() {
    super.initState();
    _loadStatuses();
    _loadRecentUpdates();
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

  void _loadRecentUpdates() {
    _recentUpdates = [
      {
        'name': 'Mr. Strickland',
        'time': '4h ago',
        'avatarColor': Colors.brown,
        'hasStory': true,
      },
      {
        'name': 'Jenny',
        'time': '9h ago',
        'avatarColor': Colors.pink,
        'hasStory': true,
        'hasHeart': true,
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
        middle: const Text('Updates'),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Status Section
            SliverToBoxAdapter(
              child: _buildStatusSection(),
            ),

            // My Status
            SliverToBoxAdapter(
              child: _buildMyStatus(),
            ),

            // Recent Updates
            if (_recentUpdates.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                  child: const Text(
                    'Recent updates',
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
                    final update = _recentUpdates[index];
                    return _buildUpdateTile(update);
                  },
                  childCount: _recentUpdates.length,
                ),
              ),
            ],

            // Channels Section
            SliverToBoxAdapter(
              child: _buildChannelsSection(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: const Text(
        'Status',
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: CupertinoColors.black,
        ),
      ),
    );
  }

  Widget _buildMyStatus() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Avatar with green plus
          Stack(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    'M',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(
                    CupertinoIcons.plus,
                    color: Colors.white,
                    size: 10,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),

          // Status Info
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My status',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: CupertinoColors.black,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Add to my status',
                  style: TextStyle(
                    fontSize: 14,
                    color: CupertinoColors.systemGrey,
                  ),
                ),
              ],
            ),
          ),

          // Camera and Edit buttons
          Row(
            children: [
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _showCameraOptions(),
                child: const Icon(
                  CupertinoIcons.camera_fill,
                  color: CupertinoColors.systemGrey,
                  size: 22,
                ),
              ),
              const SizedBox(width: 8),
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _showEditOptions(),
                child: const Icon(
                  CupertinoIcons.pencil,
                  color: CupertinoColors.systemGrey,
                  size: 22,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUpdateTile(Map<String, dynamic> update) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Avatar with story ring
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: update['hasStory']
                    ? AppTheme.primaryGreen
                    : Colors.transparent,
                width: 2,
              ),
            ),
            child: Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: update['avatarColor'],
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  update['name'][0],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Name and time
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      update['name'],
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: CupertinoColors.black,
                      ),
                    ),
                    if (update['hasHeart'] == true) ...[
                      const SizedBox(width: 4),
                      const Text(
                        '❤️',
                        style: TextStyle(fontSize: 14),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  update['time'],
                  style: const TextStyle(
                    fontSize: 14,
                    color: CupertinoColors.systemGrey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Channels',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: CupertinoColors.black,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Stay updated on topics that matter to you. Find channels to follow below.',
            style: TextStyle(
              fontSize: 14,
              color: CupertinoColors.systemGrey,
            ),
          ),
          const SizedBox(height: 16),

          // Find channels to follow
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Find channels to follow',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: CupertinoColors.black,
                  ),
                ),
              ),
              const Icon(
                CupertinoIcons.chevron_down,
                color: CupertinoColors.systemGrey,
                size: 16,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Explore more button
          Center(
            child: CupertinoButton(
              onPressed: () => _exploreChannels(),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              color: AppTheme.primaryGreen,
              borderRadius: BorderRadius.circular(20),
              child: const Text(
                'Explore more',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
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
              // Status privacy
            },
            child: const Text('Status privacy'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Clear all status
            },
            child: const Text('Clear all status'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _showCameraOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Camera'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Take photo
            },
            child: const Text('Take photo'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Record video
            },
            child: const Text('Record video'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Choose from library
            },
            child: const Text('Choose from library'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _showEditOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Edit status'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Text status
            },
            child: const Text('Text status'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // Edit current status
            },
            child: const Text('Edit current status'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  void _exploreChannels() {
    // Navigate to explore channels page
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Explore Channels'),
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
