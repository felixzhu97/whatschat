import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;
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
    // 模拟聊天数据
    _chats = [
      Chat(
        id: '1',
        name: '张三',
        type: ChatType.individual,
        participantIds: ['user1', 'user2'],
        lastMessageContent: '你好，最近怎么样？',
        lastMessageTime: DateTime.now().subtract(const Duration(minutes: 5)),
        lastMessageSender: '张三',
        unreadCount: 2,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '2',
        name: '工作群',
        type: ChatType.group,
        participantIds: ['user1', 'user2', 'user3', 'user4'],
        lastMessageContent: '明天的会议记得参加',
        lastMessageTime: DateTime.now().subtract(const Duration(hours: 1)),
        lastMessageSender: '李四',
        unreadCount: 5,
        isPinned: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '3',
        name: '王五',
        type: ChatType.individual,
        participantIds: ['user1', 'user5'],
        lastMessageContent: '好的，我知道了',
        lastMessageTime: DateTime.now().subtract(const Duration(hours: 2)),
        lastMessageSender: '王五',
        unreadCount: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '4',
        name: '家庭群',
        type: ChatType.group,
        participantIds: ['user1', 'user6', 'user7'],
        lastMessageContent: '晚上一起吃饭吧',
        lastMessageTime: DateTime.now().subtract(const Duration(hours: 3)),
        lastMessageSender: '妈妈',
        unreadCount: 1,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Chat(
        id: '5',
        name: '赵六',
        type: ChatType.individual,
        participantIds: ['user1', 'user8'],
        lastMessageContent: '文档我已经发给你了',
        lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
        lastMessageSender: '赵六',
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
          child: const Text('编辑'),
        ),
        middle: const Text('聊天'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showNewChatOptions(),
          child: const FaIcon(FontAwesomeIcons.penToSquare),
        ),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: Column(
          children: [
            // 搜索栏
            Container(
              padding: const EdgeInsets.all(16),
              child: CupertinoSearchTextField(
                controller: _searchController,
                placeholder: '搜索',
                style: CupertinoTheme.of(context).textTheme.textStyle,
              ),
            ),

            // 聊天列表
            Expanded(
              child: _buildChatList(),
            ),
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
      decoration: BoxDecoration(
        color: CupertinoTheme.of(context).scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(
            color: CupertinoColors.separator,
            width: 0.5,
          ),
        ),
      ),
      child: CupertinoListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primaryGreen,
          radius: 25,
          child: Text(
            chat.name[0].toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          chat.name,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          chat.lastMessageContent ?? '',
          style: const TextStyle(
            fontSize: 15,
            color: CupertinoColors.systemGrey,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              chat.lastMessageTime != null
                  ? _formatTime(chat.lastMessageTime!)
                  : '',
              style: const TextStyle(
                fontSize: 13,
                color: CupertinoColors.systemGrey,
              ),
            ),
            if (chat.unreadCount > 0) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.iosRed,
                  borderRadius: BorderRadius.circular(10),
                ),
                constraints: const BoxConstraints(
                  minWidth: 20,
                  minHeight: 20,
                ),
                child: Text(
                  chat.unreadCount > 99 ? '99+' : '${chat.unreadCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
        onTap: () {
          Navigator.push(
            context,
            CupertinoPageRoute(
              builder: (context) => ChatDetailScreen(chat: chat),
            ),
          );
        },
      ),
    );
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      if (difference.inDays == 1) {
        return '昨天';
      } else if (difference.inDays < 7) {
        return '${difference.inDays}天前';
      } else {
        return '${timestamp.month}/${timestamp.day}';
      }
    } else if (difference.inHours > 0) {
      return '${difference.inHours}小时前';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}分钟前';
    } else {
      return '刚刚';
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
}
