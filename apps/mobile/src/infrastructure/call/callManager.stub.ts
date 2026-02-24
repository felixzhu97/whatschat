import type { CallState } from './callTypes';

type Listener = (data: unknown) => void;

const defaultState: CallState = {
  isActive: false,
  isIncoming: false,
  contactId: '',
  contactName: '',
  contactAvatar: '',
  callType: 'voice',
  status: 'ended',
  duration: 0,
  isMuted: false,
  isVideoOff: false,
  isSpeakerOn: false,
};

export class CallManagerStub {
  private listeners = new Map<string, Listener[]>();
  private callState: CallState = { ...defaultState };

  setSocket(_socket: unknown) {}

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Listener) {
    const list = this.listeners.get(event);
    if (list) {
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    }
  }

  getCallState(): CallState {
    return { ...this.callState };
  }

  getLocalStream(): null {
    return null;
  }

  getRemoteStream(): null {
    return null;
  }

  async startCall() {
    throw new Error('Calls require a development build. Expo Go does not support WebRTC.');
  }

  async answerCall() {
    throw new Error('Calls require a development build.');
  }

  endCall() {}

  toggleMute() {}
  toggleVideo() {}
  toggleSpeaker() {}
}

let stubInstance: CallManagerStub | null = null;

export function getCallManagerStub(): CallManagerStub {
  if (!stubInstance) stubInstance = new CallManagerStub();
  return stubInstance;
}
