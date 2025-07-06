enum CallType {
  voice,
  video,
}

enum CallStatus {
  incoming,
  outgoing,
  missed,
  declined,
  busy,
  failed,
}

class Call {
  final String id;
  final String callerId;
  final String callerName;
  final String? callerAvatar;
  final String receiverId;
  final String receiverName;
  final String? receiverAvatar;
  final CallType type;
  final CallStatus status;
  final DateTime timestamp;
  final int? duration; // 通话时长（秒）
  final bool isGroupCall;
  final List<String> participants;
  final String? roomId;
  final Map<String, dynamic>? metadata;

  Call({
    required this.id,
    required this.callerId,
    required this.callerName,
    this.callerAvatar,
    required this.receiverId,
    required this.receiverName,
    this.receiverAvatar,
    required this.type,
    required this.status,
    required this.timestamp,
    this.duration,
    this.isGroupCall = false,
    this.participants = const [],
    this.roomId,
    this.metadata,
  });

  Call copyWith({
    String? id,
    String? callerId,
    String? callerName,
    String? callerAvatar,
    String? receiverId,
    String? receiverName,
    String? receiverAvatar,
    CallType? type,
    CallStatus? status,
    DateTime? timestamp,
    int? duration,
    bool? isGroupCall,
    List<String>? participants,
    String? roomId,
    Map<String, dynamic>? metadata,
  }) {
    return Call(
      id: id ?? this.id,
      callerId: callerId ?? this.callerId,
      callerName: callerName ?? this.callerName,
      callerAvatar: callerAvatar ?? this.callerAvatar,
      receiverId: receiverId ?? this.receiverId,
      receiverName: receiverName ?? this.receiverName,
      receiverAvatar: receiverAvatar ?? this.receiverAvatar,
      type: type ?? this.type,
      status: status ?? this.status,
      timestamp: timestamp ?? this.timestamp,
      duration: duration ?? this.duration,
      isGroupCall: isGroupCall ?? this.isGroupCall,
      participants: participants ?? this.participants,
      roomId: roomId ?? this.roomId,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'callerId': callerId,
      'callerName': callerName,
      'callerAvatar': callerAvatar,
      'receiverId': receiverId,
      'receiverName': receiverName,
      'receiverAvatar': receiverAvatar,
      'type': type.index,
      'status': status.index,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'duration': duration,
      'isGroupCall': isGroupCall,
      'participants': participants,
      'roomId': roomId,
      'metadata': metadata,
    };
  }

  factory Call.fromMap(Map<String, dynamic> map) {
    return Call(
      id: map['id'] ?? '',
      callerId: map['callerId'] ?? '',
      callerName: map['callerName'] ?? '',
      callerAvatar: map['callerAvatar'],
      receiverId: map['receiverId'] ?? '',
      receiverName: map['receiverName'] ?? '',
      receiverAvatar: map['receiverAvatar'],
      type: CallType.values[map['type'] ?? 0],
      status: CallStatus.values[map['status'] ?? 0],
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
      duration: map['duration'],
      isGroupCall: map['isGroupCall'] ?? false,
      participants: List<String>.from(map['participants'] ?? []),
      roomId: map['roomId'],
      metadata: map['metadata'],
    );
  }

  bool get isVoiceCall => type == CallType.voice;
  bool get isVideoCall => type == CallType.video;
  bool get isIncoming => status == CallStatus.incoming;
  bool get isOutgoing => status == CallStatus.outgoing;
  bool get isMissed => status == CallStatus.missed;
  bool get isDeclined => status == CallStatus.declined;
  bool get isBusy => status == CallStatus.busy;
  bool get isFailed => status == CallStatus.failed;

  String get durationString {
    if (duration == null) return '';

    final minutes = duration! ~/ 60;
    final seconds = duration! % 60;

    if (minutes > 0) {
      return '$minutes:${seconds.toString().padLeft(2, '0')}';
    } else {
      return '${seconds}s';
    }
  }

  @override
  String toString() {
    return 'Call(id: $id, type: $type, status: $status, duration: $duration)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Call && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
