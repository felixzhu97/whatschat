import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { CallState } from './callTypes';

export type { CallState } from './callTypes';

export interface ICallManager {
  setSocket(socket: unknown): void;
  on(event: string, cb: (data: any) => void): void;
  off(event: string, cb: (data: any) => void): void;
  getCallState(): CallState;
  getLocalStream(): unknown;
  getRemoteStream(): unknown;
  startCall(...args: unknown[]): Promise<void>;
  answerCall(): Promise<void>;
  endCall(): void;
  toggleMute(): void;
  toggleVideo(): void;
  toggleSpeaker(): void;
}

let cached: ICallManager | null = null;

function isExpoGo(): boolean {
  try {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
    // Fallback: if webrtc native module is missing (e.g. Expo Go), treat as Expo Go so we never require it.
    const { NativeModules } = require('react-native');
    const hasWebRTC = NativeModules?.WebRTCModule != null || NativeModules?.RTCModule != null;
    return !hasWebRTC;
  } catch {
    return true;
  }
}

export function getCallManager(): ICallManager {
  if (cached) return cached;
  // In Expo Go there is no WebRTC native module; use stub only so we never load callManager/webrtc.
  if (isExpoGo()) {
    const m = require('./callManager.stub');
    cached = m.getCallManagerStub() as ICallManager;
  } else {
    try {
      const m = require('./callManager');
      cached = m.getCallManager() as ICallManager;
    } catch {
      const m = require('./callManager.stub');
      cached = m.getCallManagerStub() as ICallManager;
    }
  }
  return cached as ICallManager;
}
