import { useState, useEffect, useCallback } from 'react';
import type { MediaStream } from 'react-native-webrtc';
import { useSocketStore } from '@/src/presentation/stores';
import { getCallManager, CallState } from '@/src/infrastructure/call/callManager';

export function useCall() {
  const socket = useSocketStore((s) => s.socket);
  const [callState, setCallState] = useState<CallState>(getCallManager().getCallState());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const manager = getCallManager();

  useEffect(() => {
    manager.setSocket(socket);
  }, [socket]);

  useEffect(() => {
    const onState = (s: CallState) => setCallState(s);
    const onLocal = (s: MediaStream | null) => setLocalStream(s);
    const onRemote = (s: MediaStream | null) => setRemoteStream(s);
    const onEnded = () => {
      setLocalStream(null);
      setRemoteStream(null);
      setError(null);
    };

    manager.on('callStateChanged', onState);
    manager.on('localStream', onLocal);
    manager.on('remoteStream', onRemote);
    manager.on('callEnded', onEnded);

    setCallState(manager.getCallState());
    setLocalStream(manager.getLocalStream());
    setRemoteStream(manager.getRemoteStream());

    return () => {
      manager.off('callStateChanged', onState);
      manager.off('localStream', onLocal);
      manager.off('remoteStream', onRemote);
      manager.off('callEnded', onEnded);
    };
  }, [manager]);

  const startCall = useCallback(
    async (
      contactId: string,
      contactName: string,
      contactAvatar: string,
      callType: 'voice' | 'video'
    ) => {
      try {
        setError(null);
        await manager.startCall(contactId, contactName, contactAvatar, callType);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Call failed';
        setError(msg);
      }
    },
    [manager]
  );

  const answerCall = useCallback(async () => {
    try {
      setError(null);
      await manager.answerCall();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Answer failed';
      setError(msg);
    }
  }, [manager]);

  const endCall = useCallback(() => {
    manager.endCall();
    setError(null);
  }, [manager]);

  const formatDuration = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    error,
    startCall,
    answerCall,
    endCall,
    toggleMute: () => manager.toggleMute(),
    toggleVideo: () => manager.toggleVideo(),
    toggleSpeaker: () => manager.toggleSpeaker(),
    formatDuration,
  };
}
