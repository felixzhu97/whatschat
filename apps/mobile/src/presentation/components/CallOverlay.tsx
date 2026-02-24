import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCall } from '@/src/presentation/hooks/useCall';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { ActiveCallOverlay } from './ActiveCallOverlay';

export function CallOverlay() {
  const {
    callState,
    localStream,
    remoteStream,
    error,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatDuration,
  } = useCall();

  if (callState.status === 'ringing') {
    return (
      <IncomingCallOverlay
        callState={callState}
        onAnswer={answerCall}
        onDecline={endCall}
      />
    );
  }

  if (callState.isActive) {
    return (
      <ActiveCallOverlay
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleSpeaker={toggleSpeaker}
        formatDuration={formatDuration}
      />
    );
  }

  if (error && !callState.isActive) {
    return (
      <View style={styles.errorBar} pointerEvents="box-none">
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  errorBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,59,48,0.9)',
    padding: 12,
    borderRadius: 8,
    zIndex: 999,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});
