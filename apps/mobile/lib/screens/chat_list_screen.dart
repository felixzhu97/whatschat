import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../models/models.dart';
import '../themes/app_theme.dart';
import 'chat_detail_screen.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<Chat> _chats = [];
  List<Chat> _filteredChats = [];
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  int _selectedCategoryIndex = 0; // 0: All, 1: Unread, 2: Favourites, 3: Groups

  @override
  void initState() {
    super.initState();
    _loadChats();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _loadChats() {
    // 模拟聊天数据 - 匹配设计图的内容
    _chats = [
      Chat(
        id: '1',
        name: 'Jenny',
        type: ChatType.individual,
        participantIds: ['user1', 'user2'],
        lastMessageContent: 'You reacted 👍 to "That\'s good advice, Marty."',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 114)),
        lastMessageSender: 'Jenny',
        unreadCount: 0,
        isPinned: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '2',
        name: 'Mom',
        type: ChatType.individual,
        participantIds: ['user1', 'user3'],
        lastMessageContent: 'Mom is typing...',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 15)),
        lastMessageSender: 'Mom',
        unreadCount: 1,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '3',
        name: 'Daddy',
        type: ChatType.individual,
        participantIds: ['user1', 'user4'],
        lastMessageContent: 'I mean he wrecked it! 😂',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 18)),
        lastMessageSender: 'Daddy',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '4',
        name: 'Biff Tannen',
        type: ChatType.individual,
        participantIds: ['user1', 'user5'],
        lastMessageContent: 'Say hi to your mom for me.',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 97)),
        lastMessageSender: 'Biff Tannen',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '5',
        name: 'Clocktower Lady',
        type: ChatType.individual,
        participantIds: ['user1', 'user6'],
        lastMessageContent: 'Save the clock tower?',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 225)),
        lastMessageSender: 'Clocktower Lady',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '6',
        name: 'Mr. Strickland',
        type: ChatType.individual,
        participantIds: ['user1', 'user7'],
        lastMessageContent: 'You deleted this message.',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 423)),
        lastMessageSender: 'Mr. Strickland',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '7',
        name: 'Emmett "Doc" Brown',
        type: ChatType.individual,
        participantIds: ['user1', 'user8'],
        lastMessageContent: 'Location',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 456)),
        lastMessageSender: 'Emmett "Doc" Brown',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '8',
        name: 'Dave',
        type: ChatType.individual,
        participantIds: ['user1', 'user9'],
        lastMessageContent: 'Thanks bro!',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 479)),
        lastMessageSender: 'Dave',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '9',
        name: 'Lynda',
        type: ChatType.individual,
        participantIds: ['user1', 'user10'],
        lastMessageContent: 'Ok!',
        lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
        lastMessageSender: 'Lynda',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '10',
        name: 'The time travelers',
        type: ChatType.group,
        participantIds: ['user1', 'user11', 'user12'],
        lastMessageContent:
            'Tittor: ...until the clock hits 2:17 AM, March 14th, 2036.',
        lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
        lastMessageSender: 'Tittor',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    ];
    _filteredChats = _chats;
    setState(() {});
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredChats = _chats.where((chat) {
        return chat.name.toLowerCase().contains(query) ||
            (chat.lastMessageContent?.toLowerCase().contains(query) ?? false);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showProfileSettings(),
          child: const Icon(CupertinoIcons.ellipsis),
        ),
        middle: const Text('Chats'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => _showCameraOptions(),
              child: const Icon(CupertinoIcons.camera),
            ),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => _showNewChatOptions(),
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
          ],
        ),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: Column(
          children: [
            // 分类标签
            _buildCategoryTabs(),

            // Archived 选项
            _buildArchivedOption(),

            // 聊天列表
            Expanded(
              child: _buildChatList(),
            ),

            // 底部加密提示
            _buildEncryptionNotice(),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList() {
    final filteredChats = _filteredChats;

    if (filteredChats.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FaIcon(
              FontAwesomeIcons.message,
              size: 80,
              color: CupertinoColors.systemGrey,
            ),
            SizedBox(height: 16),
            Text(
              '暂无聊天',
              style: TextStyle(
                fontSize: 16,
                color: CupertinoColors.systemGrey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: filteredChats.length,
      itemBuilder: (context, index) {
        final chat = filteredChats[index];
        return _buildChatTile(chat);
      },
    );
  }

  Widget _buildChatTile(Chat chat) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: CupertinoTheme.of(context).scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(
            color: CupertinoColors.separator.withOpacity(0.3),
            width: 0.5,
          ),
        ),
      ),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            CupertinoPageRoute(
              builder: (context) => ChatDetailScreen(chat: chat),
            ),
          );
        },
        child: Row(
          children: [
            // 头像
            _buildChatAvatar(chat),
            const SizedBox(width: 12),

            // 聊天内容
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      // 聊天名称
                      Expanded(
                        child: Row(
                          children: [
                            Flexible(
                              child: Text(
                                chat.name,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: chat.unreadCount > 0
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                  color: CupertinoColors.black,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (chat.name == 'Jenny') ...[
                              const SizedBox(width: 4),
                              const Text(
                                '❤️',
                                style: TextStyle(fontSize: 14),
                              ),
                            ],
                            if (chat.name == 'Mom') ...[
                              const SizedBox(width: 4),
                              const Text(
                                '💗',
                                style: TextStyle(fontSize: 14),
                              ),
                            ],
                          ],
                        ),
                      ),

                      // 时间和图钉
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            chat.lastMessageTime != null
                                ? _formatTime(chat.lastMessageTime!)
                                : '',
                            style: TextStyle(
                              fontSize: 13,
                              color: chat.unreadCount > 0
                                  ? AppTheme.primaryGreen
                                  : CupertinoColors.systemGrey2,
                            ),
                          ),
                          if (chat.isPinned) ...[
                            const SizedBox(width: 4),
                            const Icon(
                              CupertinoIcons.pin_fill,
                              size: 14,
                              color: CupertinoColors.systemGrey2,
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // 最后消息内容
                  Row(
                    children: [
                      // 消息状态图标
                      _buildMessageStatusIcon(chat),

                      // 消息内容
                      Expanded(
                        child: Text(
                          _getLastMessageDisplay(chat),
                          style: TextStyle(
                            fontSize: 15,
                            color: chat.unreadCount > 0
                                ? CupertinoColors.systemGrey
                                : CupertinoColors.systemGrey2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),

                      // 未读消息数量或在线状态
                      if (chat.unreadCount > 0)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryGreen,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 18,
                            minHeight: 18,
                          ),
                          child: Text(
                            chat.unreadCount > 99
                                ? '99+'
                                : '${chat.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else if (chat.name == 'Mom')
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '@',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: AppTheme.primaryGreen,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryGreen,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      if (difference.inDays == 1) {
        return 'Yesterday';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}d ago';
      } else {
        return '${timestamp.month}/${timestamp.day}';
      }
    } else {
      // 显示具体时间 (HH:mm 格式)
      final hour = timestamp.hour.toString().padLeft(2, '0');
      final minute = timestamp.minute.toString().padLeft(2, '0');
      return '$hour:$minute';
    }
  }

  void _showProfileSettings() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('选择操作'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 选择聊天
            },
            child: const Text('选择聊天'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 广播列表
            },
            child: const Text('广播列表'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 新建群组
            },
            child: const Text('新建群组'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 星标消息
            },
            child: const Text('星标消息'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 设置
            },
            child: const Text('设置'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _showNewChatOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('新建聊天'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 新建聊天
            },
            child: const Text('新建聊天'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 新建群组
            },
            child: const Text('新建群组'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 新建频道
            },
            child: const Text('新建频道'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _showCameraOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('相机'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 拍照
            },
            child: const Text('拍照'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 录制视频
            },
            child: const Text('录制视频'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 从相册选择
            },
            child: const Text('从相册选择'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  Widget _buildCategoryTabs() {
    final categories = ['All', 'Unread', 'Favourites', 'Groups'];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: categories.asMap().entries.map((entry) {
                  final index = entry.key;
                  final category = entry.value;
                  final isSelected = _selectedCategoryIndex == index;

                  return Container(
                    margin: const EdgeInsets.only(right: 8),
                    child: CupertinoButton(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      onPressed: () {
                        setState(() {
                          _selectedCategoryIndex = index;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryGreen
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                          border: isSelected
                              ? null
                              : Border.all(
                                  color: CupertinoColors.systemGrey4,
                                  width: 1,
                                ),
                        ),
                        child: Text(
                          category,
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : CupertinoColors.systemGrey,
                            fontSize: 14,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CupertinoButton(
            padding: const EdgeInsets.all(8),
            onPressed: () {
              // 更多选项
            },
            child: const Icon(
              CupertinoIcons.plus,
              color: CupertinoColors.systemGrey,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArchivedOption() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: CupertinoListTile(
        leading: const Icon(
          CupertinoIcons.archivebox,
          color: CupertinoColors.systemGrey,
        ),
        title: const Text(
          'Archived',
          style: TextStyle(
            fontSize: 16,
            color: CupertinoColors.systemGrey,
          ),
        ),
        onTap: () {
          // 显示归档聊天
        },
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
          Flexible(
            child: RichText(
              textAlign: TextAlign.center,
              text: const TextSpan(
                style: TextStyle(
                  fontSize: 13,
                  color: CupertinoColors.systemGrey2,
                ),
                children: [
                  TextSpan(text: 'Your personal messages are '),
                  TextSpan(
                    text: 'end-to-end encrypted',
                    style: TextStyle(color: AppTheme.primaryGreen),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              CupertinoIcons.refresh,
              size: 8,
              color: AppTheme.primaryGreen,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatAvatar(Chat chat) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: chat.name == 'Jenny' || chat.name == 'Mr. Strickland'
            ? Border.all(color: AppTheme.primaryGreen, width: 2)
            : null,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(25),
        child: chat.name == 'The time travelers'
            ? Container(
                color: CupertinoColors.systemGrey3,
                child: const Icon(
                  CupertinoIcons.group,
                  color: Colors.white,
                  size: 24,
                ),
              )
            : Container(
                color: _getAvatarColor(chat.name),
                child: Center(
                  child: Text(
                    chat.name[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildMessageStatusIcon(Chat chat) {
    if (chat.name == 'Jenny') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Text('👍', style: TextStyle(fontSize: 14)),
      );
    } else if (chat.name == 'Daddy') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              CupertinoIcons.checkmark,
              size: 14,
              color: AppTheme.iosBlue,
            ),
            SizedBox(width: 2),
          ],
        ),
      );
    } else if (chat.name == 'Clocktower Lady') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Icon(
          CupertinoIcons.equal,
          size: 14,
          color: CupertinoColors.systemGrey2,
        ),
      );
    } else if (chat.name == 'Mr. Strickland') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Icon(
          CupertinoIcons.clock,
          size: 14,
          color: CupertinoColors.systemGrey2,
        ),
      );
    } else if (chat.name == 'Emmett "Doc" Brown') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Icon(
          CupertinoIcons.location,
          size: 14,
          color: CupertinoColors.systemGrey2,
        ),
      );
    } else if (chat.name == 'Lynda') {
      return const Padding(
        padding: EdgeInsets.only(right: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              CupertinoIcons.checkmark,
              size: 14,
              color: AppTheme.iosBlue,
            ),
            Icon(
              CupertinoIcons.checkmark,
              size: 14,
              color: AppTheme.iosBlue,
            ),
            SizedBox(width: 2),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  String _getLastMessageDisplay(Chat chat) {
    final messageMap = {
      'Jenny': 'You reacted 👍 to "That\'s good advice, Marty."',
      'Mom': 'Mom is typing...',
      'Daddy': 'I mean he wrecked it! 😂',
      'Biff Tannen': 'Say hi to your mom for me.',
      'Clocktower Lady': 'Save the clock tower?',
      'Mr. Strickland': 'You deleted this message.',
      'Emmett "Doc" Brown': 'Location',
      'Dave': 'Thanks bro!',
      'Lynda': 'Ok!',
      'The time travelers':
          'Tittor: ...until the clock hits 2:17 AM, March 14th, 2036.',
    };

    return messageMap[chat.name] ?? chat.lastMessageContent ?? '';
  }

  Color _getAvatarColor(String name) {
    final colorMap = {
      'Jenny': Colors.pink,
      'Mom': Colors.purple,
      'Daddy': Colors.blue,
      'Biff Tannen': Colors.orange,
      'Clocktower Lady': Colors.teal,
      'Mr. Strickland': Colors.brown,
      'Emmett "Doc" Brown': Colors.indigo,
      'Dave': Colors.green,
      'Lynda': Colors.red,
    };

    return colorMap[name] ?? AppTheme.primaryGreen;
  }
}
