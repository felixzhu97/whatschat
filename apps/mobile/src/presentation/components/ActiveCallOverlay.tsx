import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RTCView } from 'react-native-webrtc';
import { useTheme } from '@/src/presentation/shared/theme';
import type { CallState } from '@/src/infrastructure/call/callManager';
import type { MediaStream } from 'react-native-webrtc';

interface ActiveCallOverlayProps {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
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
    <View style={[styles.overlay, { backgroundColor: colors.darkBackground }]}>
      {/* Remote video (full screen) or placeholder */}
      <View style={styles.remoteContainer}>
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.darkSecondaryBackground }]}>
            <Ionicons name="person" size={80} color={colors.darkSecondaryText} />
            <Text style={[styles.placeholderName, { color: colors.darkPrimaryText }]}>
              {callState.contactName}
            </Text>
            <Text style={[styles.placeholderStatus, { color: colors.darkSecondaryText }]}>
              {statusText}
            </Text>
          </View>
        )}
      </View>

      {/* Local video (picture-in-picture) for video call */}
      {callState.callType === 'video' && localStream && !callState.isVideoOff && (
        <View style={styles.localContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        </View>
      )}

      {/* Top info for voice call */}
      {callState.callType === 'voice' && (
        <View style={styles.topInfo}>
          <Text style={[styles.name, { color: colors.darkPrimaryText }]}>{callState.contactName}</Text>
          <Text style={[styles.duration, { color: colors.darkSecondaryText }]}>{statusText}</Text>
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={onToggleMute}>
          <Ionicons
            name={callState.isMuted ? 'mic-off' : 'mic'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        {callState.callType === 'video' && (
          <TouchableOpacity style={styles.controlBtn} onPress={onToggleVideo}>
            <Ionicons
              name={callState.isVideoOff ? 'videocam-off' : 'videocam'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.controlBtn} onPress={onToggleSpeaker}>
          <Ionicons
            name={callState.isSpeakerOn ? 'volume-high' : 'volume-medium'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, styles.endBtn]} onPress={onEndCall}>
          <Ionicons name="close" size={28} color="#fff" />
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
    fontSize: 22,
    fontWeight: '300',
    marginTop: 16,
  },
  placeholderStatus: {
    fontSize: 16,
    marginTop: 8,
  },
  localContainer: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  topInfo: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '300',
  },
  duration: {
    fontSize: 16,
    marginTop: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endBtn: {
    backgroundColor: '#FF3B30',
  },
});
