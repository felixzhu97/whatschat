import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/presentation/shared/theme';
import type { CallState } from '@/src/infrastructure/call/callManagerLoader';

interface IncomingCallOverlayProps {
  callState: CallState;
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallOverlay({ callState, onAnswer, onDecline }: IncomingCallOverlayProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: '#0B141A' }]}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={64} color="#8696A0" />
        </View>
        <Text style={styles.name}>{callState.contactName}</Text>
        <Text style={styles.subtitle}>
          {callState.callType === 'video' ? '视频通话' : '语音通话'} · 正在响铃...
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.iosRed }]}
            onPress={onDecline}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primaryGreen }]}
            onPress={onAnswer}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    color: '#E9EDEF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8696A0',
    marginBottom: 48,
  },
  buttons: {
    flexDirection: 'row',
    gap: 48,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
