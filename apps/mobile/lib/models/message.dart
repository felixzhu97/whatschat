enum MessageType {
  text,
  image,
  video,
  audio,
  file,
  location,
  contact,
  sticker,
  gif,
  voice,
  system,
}

enum MessageStatus {
  sent,
  delivered,
  read,
  failed,
}

class Message {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final DateTime timestamp;
  final DateTime? updatedAt;
  final String? fileName;
  final String? fileUrl;
  final String? thumbnailUrl;
  final int? fileSize;
  final String? mimeType;
  final double? latitude;
  final double? longitude;
  final String? locationName;
  final int? duration; // 用于音频和视频
  final String? replyToId;
  final String? replyToContent;
  final bool isForwarded;
  final List<String> forwardedFrom;
  final Map<String, dynamic>? metadata;

  Message({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.content,
    required this.type,
    this.status = MessageStatus.sent,
    required this.timestamp,
    this.updatedAt,
    this.fileName,
    this.fileUrl,
    this.thumbnailUrl,
    this.fileSize,
    this.mimeType,
    this.latitude,
    this.longitude,
    this.locationName,
    this.duration,
    this.replyToId,
    this.replyToContent,
    this.isForwarded = false,
    this.forwardedFrom = const [],
    this.metadata,
  });

  Message copyWith({
    String? id,
    String? chatId,
    String? senderId,
    String? senderName,
    String? senderAvatar,
    String? content,
    MessageType? type,
    MessageStatus? status,
    DateTime? timestamp,
    DateTime? updatedAt,
    String? fileName,
    String? fileUrl,
    String? thumbnailUrl,
    int? fileSize,
    String? mimeType,
    double? latitude,
    double? longitude,
    String? locationName,
    int? duration,
    String? replyToId,
    String? replyToContent,
    bool? isForwarded,
    List<String>? forwardedFrom,
    Map<String, dynamic>? metadata,
  }) {
    return Message(
      id: id ?? this.id,
      chatId: chatId ?? this.chatId,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      senderAvatar: senderAvatar ?? this.senderAvatar,
      content: content ?? this.content,
      type: type ?? this.type,
      status: status ?? this.status,
      timestamp: timestamp ?? this.timestamp,
      updatedAt: updatedAt ?? this.updatedAt,
      fileName: fileName ?? this.fileName,
      fileUrl: fileUrl ?? this.fileUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      fileSize: fileSize ?? this.fileSize,
      mimeType: mimeType ?? this.mimeType,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      locationName: locationName ?? this.locationName,
      duration: duration ?? this.duration,
      replyToId: replyToId ?? this.replyToId,
      replyToContent: replyToContent ?? this.replyToContent,
      isForwarded: isForwarded ?? this.isForwarded,
      forwardedFrom: forwardedFrom ?? this.forwardedFrom,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'chatId': chatId,
      'senderId': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'content': content,
      'type': type.index,
      'status': status.index,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'updatedAt': updatedAt?.millisecondsSinceEpoch,
      'fileName': fileName,
      'fileUrl': fileUrl,
      'thumbnailUrl': thumbnailUrl,
      'fileSize': fileSize,
      'mimeType': mimeType,
      'latitude': latitude,
      'longitude': longitude,
      'locationName': locationName,
      'duration': duration,
      'replyToId': replyToId,
      'replyToContent': replyToContent,
      'isForwarded': isForwarded,
      'forwardedFrom': forwardedFrom,
      'metadata': metadata,
    };
  }

  factory Message.fromMap(Map<String, dynamic> map) {
    return Message(
      id: map['id'] ?? '',
      chatId: map['chatId'] ?? '',
      senderId: map['senderId'] ?? '',
      senderName: map['senderName'] ?? '',
      senderAvatar: map['senderAvatar'],
      content: map['content'] ?? '',
      type: MessageType.values[map['type'] ?? 0],
      status: MessageStatus.values[map['status'] ?? 0],
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
      updatedAt: map['updatedAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['updatedAt'])
          : null,
      fileName: map['fileName'],
      fileUrl: map['fileUrl'],
      thumbnailUrl: map['thumbnailUrl'],
      fileSize: map['fileSize'],
      mimeType: map['mimeType'],
      latitude: map['latitude'],
      longitude: map['longitude'],
      locationName: map['locationName'],
      duration: map['duration'],
      replyToId: map['replyToId'],
      replyToContent: map['replyToContent'],
      isForwarded: map['isForwarded'] ?? false,
      forwardedFrom: List<String>.from(map['forwardedFrom'] ?? []),
      metadata: map['metadata'],
    );
  }

  @override
  String toString() {
    return 'Message(id: $id, type: $type, content: $content, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Message && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
