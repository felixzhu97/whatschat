import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../models/models.dart';
import '../themes/app_theme.dart';

class CallsScreen extends StatefulWidget {
  const CallsScreen({super.key});

  @override
  State<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends State<CallsScreen> {
  List<Call> _calls = [];

  @override
  void initState() {
    super.initState();
    _loadCalls();
  }

  void _loadCalls() {
    // 模拟通话记录数据
    _calls = [
      Call(
        id: '1',
        callerId: 'user1',
        callerName: '我',
        receiverId: 'user2',
        receiverName: '张三',
        type: CallType.video,
        status: CallStatus.outgoing,
        timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
        duration: 180, // 3分钟
      ),
      Call(
        id: '2',
        callerId: 'user3',
        callerName: '李四',
        receiverId: 'user1',
        receiverName: '我',
        type: CallType.voice,
        status: CallStatus.incoming,
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        duration: 120, // 2分钟
      ),
      Call(
        id: '3',
        callerId: 'user1',
        callerName: '我',
        receiverId: 'user4',
        receiverName: '王五',
        type: CallType.voice,
        status: CallStatus.missed,
        timestamp: DateTime.now().subtract(const Duration(hours: 4)),
      ),
      Call(
        id: '4',
        callerId: 'user5',
        callerName: '赵六',
        receiverId: 'user1',
        receiverName: '我',
        type: CallType.video,
        status: CallStatus.declined,
        timestamp: DateTime.now().subtract(const Duration(hours: 6)),
      ),
      Call(
        id: '5',
        callerId: 'user1',
        callerName: '我',
        receiverId: 'user6',
        receiverName: '工作群',
        type: CallType.video,
        status: CallStatus.outgoing,
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        duration: 900, // 15分钟
        isGroupCall: true,
        participants: ['user1', 'user2', 'user3', 'user4'],
      ),
      Call(
        id: '6',
        callerId: 'user7',
        callerName: '孙七',
        receiverId: 'user1',
        receiverName: '我',
        type: CallType.voice,
        status: CallStatus.incoming,
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
        duration: 60, // 1分钟
      ),
    ];
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('通话'),
        actions: [
          IconButton(
            icon: const Icon(FontAwesomeIcons.phone),
            onPressed: () => _startCall(CallType.voice),
          ),
          IconButton(
            icon: const Icon(FontAwesomeIcons.video),
            onPressed: () => _startCall(CallType.video),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'clear_history':
                  _clearCallHistory();
                  break;
                case 'settings':
                  // 通话设置
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'clear_history',
                child: Text('清除通话记录'),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Text('通话设置'),
              ),
            ],
          ),
        ],
      ),
      body: _calls.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    FontAwesomeIcons.phone,
                    size: 80,
                    color: AppTheme.lightSecondaryText,
                  ),
                  SizedBox(height: 16),
                  Text(
                    '暂无通话记录',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.lightSecondaryText,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              itemCount: _calls.length,
              itemBuilder: (context, index) {
                final call = _calls[index];
                return _buildCallTile(call);
              },
            ),
    );
  }

  Widget _buildCallTile(Call call) {
    IconData statusIcon;
    Color statusColor;

    // 确定状态图标和颜色
    switch (call.status) {
      case CallStatus.outgoing:
        statusIcon = FontAwesomeIcons.arrowUp;
        statusColor = AppTheme.primaryGreen;
        break;
      case CallStatus.incoming:
        statusIcon = FontAwesomeIcons.arrowDown;
        statusColor = AppTheme.primaryGreen;
        break;
      case CallStatus.missed:
        statusIcon = FontAwesomeIcons.arrowDown;
        statusColor = Colors.red;
        break;
      case CallStatus.declined:
        statusIcon = FontAwesomeIcons.xmark;
        statusColor = Colors.red;
        break;
      default:
        statusIcon = FontAwesomeIcons.phone;
        statusColor = AppTheme.lightSecondaryText;
    }

    // 确定对方姓名
    final otherPersonName =
        call.isIncoming ? call.callerName : call.receiverName;

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: AppTheme.primaryGreen,
        radius: 25,
        child: Text(
          otherPersonName[0].toUpperCase(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              otherPersonName,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          if (call.isGroupCall)
            const Icon(
              FontAwesomeIcons.userGroup,
              size: 16,
              color: AppTheme.lightSecondaryText,
            ),
        ],
      ),
      subtitle: Row(
        children: [
          Icon(
            statusIcon,
            size: 14,
            color: statusColor,
          ),
          const SizedBox(width: 4),
          Icon(
            call.isVideoCall ? FontAwesomeIcons.video : FontAwesomeIcons.phone,
            size: 14,
            color: AppTheme.lightSecondaryText,
          ),
          const SizedBox(width: 8),
          Text(
            timeago.format(call.timestamp, locale: 'zh'),
            style: const TextStyle(
              color: AppTheme.lightSecondaryText,
              fontSize: 13,
            ),
          ),
          if (call.duration != null) ...[
            const Text(
              ' • ',
              style: TextStyle(
                color: AppTheme.lightSecondaryText,
                fontSize: 13,
              ),
            ),
            Text(
              call.durationString,
              style: const TextStyle(
                color: AppTheme.lightSecondaryText,
                fontSize: 13,
              ),
            ),
          ],
        ],
      ),
      trailing: IconButton(
        icon: Icon(
          call.isVideoCall ? FontAwesomeIcons.video : FontAwesomeIcons.phone,
          color: AppTheme.primaryGreen,
        ),
        onPressed: () => _makeCall(call),
      ),
      onTap: () => _showCallDetails(call),
    );
  }

  void _startCall(CallType type) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              type == CallType.voice ? '语音通话' : '视频通话',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(FontAwesomeIcons.user),
              title: const Text('联系人'),
              subtitle: const Text('选择联系人进行通话'),
              onTap: () {
                Navigator.pop(context);
                _selectContact(type);
              },
            ),
            ListTile(
              leading: const Icon(FontAwesomeIcons.userGroup),
              title: const Text('群组通话'),
              subtitle: const Text('发起群组通话'),
              onTap: () {
                Navigator.pop(context);
                _startGroupCall(type);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _selectContact(CallType type) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text('选择联系人进行${type == CallType.voice ? '语音' : '视频'}通话')),
    );
  }

  void _startGroupCall(CallType type) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('发起群组${type == CallType.voice ? '语音' : '视频'}通话')),
    );
  }

  void _makeCall(Call call) {
    final otherPersonName =
        call.isIncoming ? call.callerName : call.receiverName;
    final callType = call.isVideoCall ? '视频' : '语音';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('正在呼叫 $otherPersonName ($callType)')),
    );
  }

  void _showCallDetails(Call call) {
    final otherPersonName =
        call.isIncoming ? call.callerName : call.receiverName;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(otherPersonName),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('通话类型: ${call.isVideoCall ? '视频通话' : '语音通话'}'),
            const SizedBox(height: 8),
            Text('通话状态: ${_getStatusText(call.status)}'),
            const SizedBox(height: 8),
            Text('通话时间: ${timeago.format(call.timestamp, locale: 'zh')}'),
            if (call.duration != null) ...[
              const SizedBox(height: 8),
              Text('通话时长: ${call.durationString}'),
            ],
            if (call.isGroupCall) ...[
              const SizedBox(height: 8),
              Text('参与人数: ${call.participants.length}'),
            ],
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
              _makeCall(call);
            },
            child: const Text('回拨'),
          ),
        ],
      ),
    );
  }

  String _getStatusText(CallStatus status) {
    switch (status) {
      case CallStatus.outgoing:
        return '拨出';
      case CallStatus.incoming:
        return '接听';
      case CallStatus.missed:
        return '未接';
      case CallStatus.declined:
        return '拒绝';
      case CallStatus.busy:
        return '忙碌';
      case CallStatus.failed:
        return '失败';
    }
  }

  void _clearCallHistory() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('清除通话记录'),
        content: const Text('确定要清除所有通话记录吗？此操作无法撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _calls.clear();
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('通话记录已清除')),
              );
            },
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }
}
