import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message, MessageType, MessageStatus } from '@/src/domain/entities';
import { useTheme } from '@/src/presentation/shared/theme';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showSenderName?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showSenderName = false,
  onTap,
  onLongPress,
}) => {
  const { colors } = useTheme();

  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();

    if (
      now.getDate() === timestamp.getDate() &&
      now.getMonth() === timestamp.getMonth() &&
      now.getFullYear() === timestamp.getFullYear()
    ) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      return `${timestamp.getMonth() + 1}/${timestamp.getDate()} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };

  const renderMessageStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.Sent:
        return <Ionicons name="checkmark" size={12} color={colors.secondaryText} />;
      case MessageStatus.Delivered:
        return <Ionicons name="checkmark-done" size={12} color={colors.secondaryText} />;
      case MessageStatus.Read:
        return <Ionicons name="checkmark-done" size={12} color={colors.deliveredColor} />;
      case MessageStatus.Failed:
        return <Ionicons name="alert-circle" size={12} color={colors.iosRed} />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.Text:
        return (
          <Text
            style={[
              styles.messageText,
              { color: isMe ? '#FFFFFF' : colors.primaryText },
            ]}
          >
            {message.content}
          </Text>
        );
      case MessageType.Image:
        return (
          <Image
            source={{ uri: message.fileUrl || message.content }}
            style={styles.imageMessage}
            resizeMode="cover"
          />
        );
      case MessageType.Video:
        return (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: message.thumbnailUrl || message.fileUrl || message.content }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={48} color="#FFFFFF" />
            </View>
            {message.duration && (
              <View style={styles.videoDuration}>
                <Text style={styles.durationText}>{formatDuration(message.duration)}</Text>
              </View>
            )}
          </View>
        );
      case MessageType.Audio:
      case MessageType.Voice:
        return (
          <View style={styles.audioContainer}>
            <View style={[styles.audioIcon, { backgroundColor: colors.primaryGreen }]}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.audioInfo}>
              <Text style={styles.audioLabel}>
                {message.type === MessageType.Voice ? '语音消息' : '音频文件'}
              </Text>
              <Text style={styles.audioDuration}>
                {message.duration ? formatDuration(message.duration) : '00:00'}
              </Text>
            </View>
          </View>
        );
      case MessageType.File:
        return (
          <View style={styles.fileContainer}>
            <View style={[styles.fileIcon, { backgroundColor: colors.primaryGreen }]}>
              <Ionicons name="document" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message.fileName || '文件'}
              </Text>
              <Text style={styles.fileSize}>
                {message.fileSize ? formatFileSize(message.fileSize) : '未知大小'}
              </Text>
            </View>
          </View>
        );
      case MessageType.Location:
        return (
          <View style={styles.locationContainer}>
            <View style={[styles.locationIcon, { backgroundColor: colors.iosRed }]}>
              <Ionicons name="location" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>位置</Text>
              <Text style={styles.locationName} numberOfLines={1}>
                {message.locationName || '未知位置'}
              </Text>
            </View>
          </View>
        );
      case MessageType.System:
        return (
          <View style={styles.systemContainer}>
            <Text style={styles.systemText}>{message.content}</Text>
          </View>
        );
      default:
        return (
          <Text
            style={[
              styles.messageText,
              { color: isMe ? '#FFFFFF' : colors.primaryText },
            ]}
          >
            {message.content}
          </Text>
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onTap}
      onLongPress={onLongPress}
      style={[
        styles.container,
        { justifyContent: isMe ? 'flex-end' : 'flex-start' },
      ]}
    >
      {!isMe && (
        <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
          <Text style={styles.avatarText}>
            {message.senderName?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
      )}
      <View style={[styles.messageWrapper, { maxWidth: '70%' }]}>
        {message.replyToId && (
          <View style={styles.replyIndicator}>
            <View style={[styles.replyBorder, { backgroundColor: colors.primaryGreen }]} />
            <View style={styles.replyContent}>
              <Text style={[styles.replyLabel, { color: colors.primaryGreen }]}>回复</Text>
              <Text style={styles.replyText} numberOfLines={2}>
                {message.replyToContent || ''}
              </Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMe ? colors.myMessageBubble : colors.otherMessageBubble,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
              borderBottomRightRadius: isMe ? 4 : 18,
            },
          ]}
        >
          {!isMe && message.type !== MessageType.System && (
            <Text style={[styles.senderName, { color: colors.primaryGreen }]}>
              {message.senderName}
            </Text>
          )}
          {renderMessageContent()}
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
          {isMe && renderMessageStatusIcon()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageWrapper: {
    flex: 1,
  },
  replyIndicator: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 12,
    flexDirection: 'row',
  },
  replyBorder: {
    width: 3,
    marginRight: 8,
    borderRadius: 2,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: '#808080',
  },
  bubble: {
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  videoContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  audioContainer: {
    width: 200,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: '#808080',
  },
  fileContainer: {
    width: 200,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#808080',
  },
  locationContainer: {
    width: 200,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationName: {
    fontSize: 12,
    color: '#808080',
  },
  systemContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 12,
  },
  systemText: {
    fontSize: 13,
    color: '#808080',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#808080',
  },
});

