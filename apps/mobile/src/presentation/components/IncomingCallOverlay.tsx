import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/presentation/shared/theme';
import type { CallState } from '@/src/infrastructure/call/callManager';

interface IncomingCallOverlayProps {
  callState: CallState;
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallOverlay({ callState, onAnswer, onDecline }: IncomingCallOverlayProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: colors.darkBackground }]}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={64} color={colors.darkSecondaryText} />
        </View>
        <Text style={[styles.name, { color: colors.lightPrimaryText }]}>{callState.contactName}</Text>
        <Text style={[styles.subtitle, { color: colors.darkSecondaryText }]}>
          {callState.callType === 'video' ? '视频通话' : '语音通话'}来电
        </Text>
        <Text style={[styles.ringing, { color: colors.darkSecondaryText }]}>正在响铃...</Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.declineBtn]}
            onPress={onDecline}
            activeOpacity={0.8}
          >
            <Ionicons name="call-reject" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.answerBtn]}
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
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  ringing: {
    fontSize: 14,
    marginBottom: 48,
  },
  buttons: {
    flexDirection: 'row',
    gap: 48,
  },
  btn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#FF3B30',
  },
  answerBtn: {
    backgroundColor: '#34C759',
  },
});
