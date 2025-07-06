enum ChatType {
  individual,
  group,
  broadcast,
}

class Chat {
  final String id;
  final String name;
  final String? description;
  final ChatType type;
  final List<String> participantIds;
  final String? groupImage;
  final String? lastMessageId;
  final String? lastMessageContent;
  final DateTime? lastMessageTime;
  final String? lastMessageSender;
  final int unreadCount;
  final bool isMuted;
  final DateTime? mutedUntil;
  final bool isPinned;
  final bool isArchived;
  final String? adminId;
  final List<String> adminIds;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? settings;

  Chat({
    required this.id,
    required this.name,
    this.description,
    required this.type,
    required this.participantIds,
    this.groupImage,
    this.lastMessageId,
    this.lastMessageContent,
    this.lastMessageTime,
    this.lastMessageSender,
    this.unreadCount = 0,
    this.isMuted = false,
    this.mutedUntil,
    this.isPinned = false,
    this.isArchived = false,
    this.adminId,
    this.adminIds = const [],
    required this.createdAt,
    required this.updatedAt,
    this.settings,
  });

  Chat copyWith({
    String? id,
    String? name,
    String? description,
    ChatType? type,
    List<String>? participantIds,
    String? groupImage,
    String? lastMessageId,
    String? lastMessageContent,
    DateTime? lastMessageTime,
    String? lastMessageSender,
    int? unreadCount,
    bool? isMuted,
    DateTime? mutedUntil,
    bool? isPinned,
    bool? isArchived,
    String? adminId,
    List<String>? adminIds,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? settings,
  }) {
    return Chat(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      participantIds: participantIds ?? this.participantIds,
      groupImage: groupImage ?? this.groupImage,
      lastMessageId: lastMessageId ?? this.lastMessageId,
      lastMessageContent: lastMessageContent ?? this.lastMessageContent,
      lastMessageTime: lastMessageTime ?? this.lastMessageTime,
      lastMessageSender: lastMessageSender ?? this.lastMessageSender,
      unreadCount: unreadCount ?? this.unreadCount,
      isMuted: isMuted ?? this.isMuted,
      mutedUntil: mutedUntil ?? this.mutedUntil,
      isPinned: isPinned ?? this.isPinned,
      isArchived: isArchived ?? this.isArchived,
      adminId: adminId ?? this.adminId,
      adminIds: adminIds ?? this.adminIds,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      settings: settings ?? this.settings,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'type': type.index,
      'participantIds': participantIds,
      'groupImage': groupImage,
      'lastMessageId': lastMessageId,
      'lastMessageContent': lastMessageContent,
      'lastMessageTime': lastMessageTime?.millisecondsSinceEpoch,
      'lastMessageSender': lastMessageSender,
      'unreadCount': unreadCount,
      'isMuted': isMuted,
      'mutedUntil': mutedUntil?.millisecondsSinceEpoch,
      'isPinned': isPinned,
      'isArchived': isArchived,
      'adminId': adminId,
      'adminIds': adminIds,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt.millisecondsSinceEpoch,
      'settings': settings,
    };
  }

  factory Chat.fromMap(Map<String, dynamic> map) {
    return Chat(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'],
      type: ChatType.values[map['type'] ?? 0],
      participantIds: List<String>.from(map['participantIds'] ?? []),
      groupImage: map['groupImage'],
      lastMessageId: map['lastMessageId'],
      lastMessageContent: map['lastMessageContent'],
      lastMessageTime: map['lastMessageTime'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['lastMessageTime'])
          : null,
      lastMessageSender: map['lastMessageSender'],
      unreadCount: map['unreadCount'] ?? 0,
      isMuted: map['isMuted'] ?? false,
      mutedUntil: map['mutedUntil'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['mutedUntil'])
          : null,
      isPinned: map['isPinned'] ?? false,
      isArchived: map['isArchived'] ?? false,
      adminId: map['adminId'],
      adminIds: List<String>.from(map['adminIds'] ?? []),
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt']),
      settings: map['settings'],
    );
  }

  bool get isGroup => type == ChatType.group;
  bool get isIndividual => type == ChatType.individual;
  bool get isBroadcast => type == ChatType.broadcast;

  @override
  String toString() {
    return 'Chat(id: $id, name: $name, type: $type, participantIds: ${participantIds.length})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Chat && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
