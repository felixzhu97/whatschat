import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../models/models.dart';
import '../themes/app_theme.dart';
import '../widgets/message_bubble.dart';
import '../widgets/chat_input_field.dart';

class ChatDetailScreen extends StatefulWidget {
  final Chat chat;
  final User? otherUser;

  const ChatDetailScreen({
    super.key,
    required this.chat,
    this.otherUser,
  });

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Message> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _loadMessages();

    // 监听输入状态
    _messageController.addListener(() {
      final isTyping = _messageController.text.isNotEmpty;
      if (isTyping != _isTyping) {
        setState(() {
          _isTyping = isTyping;
        });
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadMessages() {
    // 模拟消息数据
    _messages = [
      Message(
        id: '1',
        chatId: widget.chat.id,
        senderId: 'user2',
        senderName: widget.chat.name,
        content: '你好！',
        type: MessageType.text,
        timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
        status: MessageStatus.read,
      ),
      Message(
        id: '2',
        chatId: widget.chat.id,
        senderId: 'user1',
        senderName: '我',
        content: '你好，最近怎么样？',
        type: MessageType.text,
        timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
        status: MessageStatus.read,
      ),
      Message(
        id: '3',
        chatId: widget.chat.id,
        senderId: 'user2',
        senderName: widget.chat.name,
        content: '挺好的，你呢？',
        type: MessageType.text,
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        status: MessageStatus.delivered,
      ),
      Message(
        id: '4',
        chatId: widget.chat.id,
        senderId: 'user1',
        senderName: '我',
        content: '我也不错，今天天气很好',
        type: MessageType.text,
        timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
        status: MessageStatus.sent,
      ),
    ];
    setState(() {});
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => Navigator.pop(context),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(CupertinoIcons.chevron_left),
              CircleAvatar(
                backgroundColor: AppTheme.primaryGreen,
                radius: 15,
                child: Text(
                  widget.chat.name[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        middle: Column(
          children: [
            Text(
              widget.chat.name,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (_isTyping)
              const Text(
                '正在输入...',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.primaryGreen,
                ),
              )
            else
              Text(
                widget.chat.isGroup
                    ? '${widget.chat.participantIds.length} 人'
                    : '最后上线时间：刚刚',
                style: const TextStyle(
                  fontSize: 12,
                  color: CupertinoColors.systemGrey,
                ),
              ),
          ],
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => _showChatOptions(),
          child: const FaIcon(FontAwesomeIcons.phone),
        ),
        backgroundColor: CupertinoTheme.of(context).barBackgroundColor,
      ),
      child: SafeArea(
        child: Column(
          children: [
            // 消息列表
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: CupertinoTheme.of(context).scaffoldBackgroundColor,
                ),
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    final isMe = message.senderId == 'user1';

                    return MessageBubble(
                      message: message,
                      isMe: isMe,
                      showSenderName: widget.chat.isGroup && !isMe,
                      onTap: () => _onMessageTap(message),
                      onLongPress: () => _onMessageLongPress(message),
                    );
                  },
                ),
              ),
            ),

            // 输入框
            Container(
              decoration: BoxDecoration(
                color: CupertinoTheme.of(context).barBackgroundColor,
                border: Border(
                  top: BorderSide(
                    color: CupertinoColors.separator,
                    width: 0.5,
                  ),
                ),
              ),
              child: ChatInputField(
                controller: _messageController,
                onSend: _sendTextMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _sendTextMessage(String text) {
    if (text.trim().isEmpty) return;

    final message = Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      chatId: widget.chat.id,
      senderId: 'user1',
      senderName: '我',
      content: text.trim(),
      type: MessageType.text,
      timestamp: DateTime.now(),
      status: MessageStatus.sent,
    );

    setState(() {
      _messages.add(message);
      _messageController.clear();
    });

    // 滚动到底部
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });

    // 模拟消息发送状态更新
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          final index = _messages.indexWhere((m) => m.id == message.id);
          if (index != -1) {
            _messages[index] = message.copyWith(status: MessageStatus.sent);
          }
        });
      }
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          final index = _messages.indexWhere((m) => m.id == message.id);
          if (index != -1) {
            _messages[index] =
                message.copyWith(status: MessageStatus.delivered);
          }
        });
      }
    });
  }

  void _sendImageMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('发送图片功能待实现')),
    );
  }

  void _sendFileMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('发送文件功能待实现')),
    );
  }

  void _sendVoiceMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('发送语音功能待实现')),
    );
  }

  void _sendLocationMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('发送位置功能待实现')),
    );
  }

  void _handleTyping(bool isTyping) {
    setState(() {
      _isTyping = isTyping;
    });
  }

  void _onMessageTap(Message message) {
    // 点击消息处理
    if (message.type == MessageType.image) {
      // 查看图片
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('查看图片功能待实现')),
      );
    } else if (message.type == MessageType.video) {
      // 播放视频
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('播放视频功能待实现')),
      );
    }
  }

  void _onMessageLongPress(Message message) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text('${message.content} 选项'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _replyToMessage(message);
            },
            child: const Text('回复'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _forwardMessage(message);
            },
            child: const Text('转发'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _starMessage(message);
            },
            child: const Text('星标'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _copyMessage(message);
            },
            child: const Text('复制'),
          ),
          if (message.senderId == 'user1') ...[
            CupertinoActionSheetAction(
              onPressed: () {
                Navigator.pop(context);
                _deleteMessage(message);
              },
              child: const Text('删除', style: TextStyle(color: Colors.red)),
            ),
          ],
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _replyToMessage(Message message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('回复消息：${message.content}')),
    );
  }

  void _forwardMessage(Message message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('转发消息：${message.content}')),
    );
  }

  void _starMessage(Message message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('星标消息：${message.content}')),
    );
  }

  void _copyMessage(Message message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('复制消息：${message.content}')),
    );
  }

  void _deleteMessage(Message message) {
    setState(() {
      _messages.removeWhere((m) => m.id == message.id);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('消息已删除')),
    );
  }

  void _showChatOptions() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text('${widget.chat.name} 选项'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 语音通话
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FaIcon(FontAwesomeIcons.phone),
                SizedBox(width: 8),
                Text('语音通话'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 视频通话
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FaIcon(FontAwesomeIcons.video),
                SizedBox(width: 8),
                Text('视频通话'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 查看联系人
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FaIcon(FontAwesomeIcons.user),
                SizedBox(width: 8),
                Text('查看联系人'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 媒体文件
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FaIcon(FontAwesomeIcons.image),
                SizedBox(width: 8),
                Text('媒体文件'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              // 搜索
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FaIcon(FontAwesomeIcons.magnifyingGlass),
                SizedBox(width: 8),
                Text('搜索'),
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
}
