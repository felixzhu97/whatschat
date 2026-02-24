import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useTheme } from '@/src/presentation/shared/theme';
import type { CallState } from '@/src/infrastructure/call/callManagerLoader';

// Load RTCView only when NOT in Expo Go, so we never touch the native webrtc module in Expo Go
let RTCViewComponent: React.ComponentType<{ streamURL: string; style: any; objectFit?: string }> | null = null;
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  try {
    RTCViewComponent = require('react-native-webrtc').RTCView;
  } catch {}
}

interface StreamLike {
  toURL(): string;
}

interface ActiveCallOverlayProps {
  callState: CallState;
  localStream: StreamLike | null;
  remoteStream: StreamLike | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  formatDuration: (seconds: number) => string;
}

export function ActiveCallOverlay({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  formatDuration,
}: ActiveCallOverlayProps) {
  const { colors } = useTheme();

  const statusText =
    callState.status === 'calling'
      ? '正在呼叫...'
      : callState.status === 'connected'
        ? formatDuration(callState.duration)
        : '连接中...';

  return (
    <View style={[styles.overlay, { backgroundColor: '#0B141A' }]}>
      {/* Top bar: name + status/duration (WhatsApp style) */}
      <View style={styles.topBar}>
        <Text style={styles.topName} numberOfLines={1}>{callState.contactName}</Text>
        <Text style={styles.topStatus}>
          {statusText}
          {callState.callType === 'video' ? ' · 视频通话' : ' · 语音通话'}
        </Text>
      </View>

      {/* Remote video (full screen) or placeholder */}
      <View style={styles.remoteContainer}>
        {remoteStream && RTCViewComponent ? (
          <RTCViewComponent
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={80} color="#8696A0" />
            <Text style={[styles.placeholderName, { color: '#E9EDEF' }]}>
              {callState.contactName}
            </Text>
            <Text style={styles.placeholderStatus}>
              等待视频连接...
            </Text>
          </View>
        )}
      </View>

      {/* Local video (picture-in-picture) for video call */}
      {callState.callType === 'video' && localStream && RTCViewComponent && !callState.isVideoOff && (
        <View style={styles.localContainer}>
          <RTCViewComponent
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        </View>
      )}

      {callState.callType === 'video' && (callState.isVideoOff || !localStream) && (
        <View style={styles.localPlaceholder}>
          <Ionicons name="videocam-off" size={32} color="rgba(255,255,255,0.7)" />
        </View>
      )}

      {/* Bottom controls - WhatsApp style */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, callState.isMuted && styles.controlBtnOff]}
          onPress={onToggleMute}
        >
          <Ionicons name={callState.isMuted ? 'mic-off' : 'mic'} size={26} color="#fff" />
        </TouchableOpacity>
        {callState.callType === 'video' && (
          <TouchableOpacity
            style={[styles.controlBtn, callState.isVideoOff && styles.controlBtnOff]}
            onPress={onToggleVideo}
          >
            <Ionicons name={callState.isVideoOff ? 'videocam-off' : 'videocam'} size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.controlBtn, callState.isSpeakerOn && { backgroundColor: colors.primaryGreen }]}
          onPress={onToggleSpeaker}
        >
          <Ionicons name={callState.isSpeakerOn ? 'volume-high' : 'volume-medium'} size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.endBtn]} onPress={onEndCall}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  topName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E9EDEF',
  },
  topStatus: {
    fontSize: 14,
    color: '#8696A0',
    marginTop: 4,
  },
  remoteContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderName: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 16,
  },
  placeholderStatus: {
    fontSize: 15,
    color: '#8696A0',
    marginTop: 8,
  },
  localContainer: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 112,
    height: 144,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  localPlaceholder: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 112,
    height: 144,
    borderRadius: 12,
    backgroundColor: '#2A3942',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnOff: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  endBtn: {
    backgroundColor: '#E53935',
  },
});
