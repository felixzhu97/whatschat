enum StatusType {
  text,
  image,
  video,
}

enum StatusPrivacy {
  contacts,
  contactsExcept,
  onlyShareWith,
}

class Status {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String content;
  final StatusType type;
  final String? mediaUrl;
  final String? thumbnailUrl;
  final String? backgroundColor;
  final String? textColor;
  final String? fontFamily;
  final double? fontSize;
  final int? duration;
  final DateTime timestamp;
  final DateTime expiresAt;
  final StatusPrivacy privacy;
  final List<String> allowedViewers;
  final List<String> blockedViewers;
  final List<String> viewers;
  final Map<String, dynamic>? metadata;

  Status({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.content,
    required this.type,
    this.mediaUrl,
    this.thumbnailUrl,
    this.backgroundColor,
    this.textColor,
    this.fontFamily,
    this.fontSize,
    this.duration,
    required this.timestamp,
    required this.expiresAt,
    this.privacy = StatusPrivacy.contacts,
    this.allowedViewers = const [],
    this.blockedViewers = const [],
    this.viewers = const [],
    this.metadata,
  });

  Status copyWith({
    String? id,
    String? userId,
    String? userName,
    String? userAvatar,
    String? content,
    StatusType? type,
    String? mediaUrl,
    String? thumbnailUrl,
    String? backgroundColor,
    String? textColor,
    String? fontFamily,
    double? fontSize,
    int? duration,
    DateTime? timestamp,
    DateTime? expiresAt,
    StatusPrivacy? privacy,
    List<String>? allowedViewers,
    List<String>? blockedViewers,
    List<String>? viewers,
    Map<String, dynamic>? metadata,
  }) {
    return Status(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userAvatar: userAvatar ?? this.userAvatar,
      content: content ?? this.content,
      type: type ?? this.type,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      textColor: textColor ?? this.textColor,
      fontFamily: fontFamily ?? this.fontFamily,
      fontSize: fontSize ?? this.fontSize,
      duration: duration ?? this.duration,
      timestamp: timestamp ?? this.timestamp,
      expiresAt: expiresAt ?? this.expiresAt,
      privacy: privacy ?? this.privacy,
      allowedViewers: allowedViewers ?? this.allowedViewers,
      blockedViewers: blockedViewers ?? this.blockedViewers,
      viewers: viewers ?? this.viewers,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'content': content,
      'type': type.index,
      'mediaUrl': mediaUrl,
      'thumbnailUrl': thumbnailUrl,
      'backgroundColor': backgroundColor,
      'textColor': textColor,
      'fontFamily': fontFamily,
      'fontSize': fontSize,
      'duration': duration,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'expiresAt': expiresAt.millisecondsSinceEpoch,
      'privacy': privacy.index,
      'allowedViewers': allowedViewers,
      'blockedViewers': blockedViewers,
      'viewers': viewers,
      'metadata': metadata,
    };
  }

  factory Status.fromMap(Map<String, dynamic> map) {
    return Status(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      userAvatar: map['userAvatar'],
      content: map['content'] ?? '',
      type: StatusType.values[map['type'] ?? 0],
      mediaUrl: map['mediaUrl'],
      thumbnailUrl: map['thumbnailUrl'],
      backgroundColor: map['backgroundColor'],
      textColor: map['textColor'],
      fontFamily: map['fontFamily'],
      fontSize: map['fontSize'],
      duration: map['duration'],
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
      expiresAt: DateTime.fromMillisecondsSinceEpoch(map['expiresAt']),
      privacy: StatusPrivacy.values[map['privacy'] ?? 0],
      allowedViewers: List<String>.from(map['allowedViewers'] ?? []),
      blockedViewers: List<String>.from(map['blockedViewers'] ?? []),
      viewers: List<String>.from(map['viewers'] ?? []),
      metadata: map['metadata'],
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isText => type == StatusType.text;
  bool get isImage => type == StatusType.image;
  bool get isVideo => type == StatusType.video;

  @override
  String toString() {
    return 'Status(id: $id, userId: $userId, type: $type, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Status && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
