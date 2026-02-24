import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { Socket } from 'socket.io-client';
import { apiClient } from '@/src/infrastructure/api/client';
import { useAuthStore } from '@/src/presentation/stores';

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
}

function getCurrentUserId(): string | null {
  const user = useAuthStore.getState().user;
  return user?.id ?? null;
}

type Listener = (data: unknown) => void;

export class CallManager {
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: Socket | null = null;
  private listeners = new Map<string, Listener[]>();
  private callState: CallState = {
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
  private durationTimer: ReturnType<typeof setInterval> | null = null;
  private currentCallId: string | null = null;
  private currentInitiatorId: string | null = null;

  setSocket(socket: Socket | null) {
    if (this.socket === socket) return;
    const prev = this.socket;
    if (prev) {
      prev.off('call:incoming');
      prev.off('call:answer');
      prev.off('call:offer');
      prev.off('call:webrtc-answer');
      prev.off('call:ice-candidate');
      prev.off('call:end');
    }
    this.socket = socket;
    if (socket) {
      socket.on('call:incoming', (d: unknown) => this.handleCallIncoming(d));
      socket.on('call:answer', (d: unknown) => this.handleCallAnswer(d));
      socket.on('call:offer', (d: unknown) => this.handleCallOffer(d));
      socket.on('call:webrtc-answer', (d: unknown) => this.handleWebRTCAnswer(d));
      socket.on('call:ice-candidate', (d: unknown) => this.handleIceCandidate(d));
      socket.on('call:end', () => this.handleCallEnd());
    }
  }

  private targetUserId(): string {
    if (this.callState.isIncoming && this.currentInitiatorId) return this.currentInitiatorId;
    return this.callState.contactId;
  }

  private emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

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

  private updateState(updates: Partial<CallState>) {
    this.callState = { ...this.callState, ...updates };
    this.emit('callStateChanged', this.callState);
  }

  getCallState(): CallState {
    return { ...this.callState };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  private async createPeerConnection() {
    if (this.peer) return;
    const callId = this.currentCallId;
    const targetUserId = this.targetUserId();

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    this.peer = peer;

    (peer as any).onicecandidate = (e: { candidate: any }) => {
      if (e.candidate && callId && this.socket?.connected) {
        this.socket.emit('call:ice-candidate', {
          callId,
          targetUserId,
          candidate: e.candidate,
        });
      }
    };
    (peer as any).ontrack = (e: { streams?: MediaStream[] }) => {
      if (e.streams?.[0]) {
        this.remoteStream = e.streams[0];
        this.emit('remoteStream', this.remoteStream);
      }
    };
    (peer as any).onconnectionstatechange = () => {
      const state = (this.peer as any)?.connectionState;
      if (state === 'connected') {
        this.updateState({ status: 'connected' });
        this.startDurationTimer();
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall();
      }
    };
  }

  private startDurationTimer() {
    if (this.durationTimer) clearInterval(this.durationTimer);
    this.durationTimer = setInterval(() => {
      this.updateState({ duration: this.callState.duration + 1 });
    }, 1000);
  }

  async startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: 'voice' | 'video'
  ) {
    if (!this.socket?.connected) throw new Error('Not connected');
    this.updateState({
      isActive: true,
      isIncoming: false,
      contactId,
      contactName,
      contactAvatar,
      callType,
      status: 'calling',
      isVideoOff: callType === 'voice',
    });

    const apiType = callType === 'video' ? 'VIDEO' : 'AUDIO';
    const res = await apiClient.post<{ success: boolean; data: { id: string } }>('/calls', {
      type: apiType,
      targetUserId: contactId,
    });
    const callId = res.data?.data?.id;
    if (!callId) throw new Error('Failed to create call');
    this.currentCallId = callId;
    this.currentInitiatorId = getCurrentUserId();

    this.socket.emit('call:incoming', {
      targetUserId: contactId,
      callId,
      type: callType,
      callerName: contactName,
      callerAvatar: contactAvatar,
    });

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video' ? { width: 640, height: 480 } : false,
    });
    this.localStream = stream;
    this.emit('localStream', stream);
  }

  private handleCallIncoming(payload: unknown) {
    const d = payload as Record<string, unknown>;
    const initiatorId = d.initiatorId as string;
    const callId = d.callId as string;
    const callType = ((d.type as string) || 'voice') as 'voice' | 'video';
    this.currentCallId = callId;
    this.currentInitiatorId = initiatorId;
    this.updateState({
      isActive: true,
      isIncoming: true,
      contactId: initiatorId,
      contactName: (d.callerName as string) ?? 'Unknown',
      contactAvatar: (d.callerAvatar as string) ?? '',
      callType,
      status: 'ringing',
      isVideoOff: callType === 'voice',
    });
    this.emit('incomingCall', this.callState);
  }

  private async handleCallAnswer(payload: unknown) {
    const d = payload as Record<string, unknown>;
    if (d.callId !== this.currentCallId || !this.callState.isActive || this.callState.isIncoming)
      return;
    try {
      await this.createPeerConnection();
      if (!this.peer || !this.localStream) return;
      this.localStream.getTracks().forEach((t) => this.peer!.addTrack(t, this.localStream!));
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      this.socket?.emit('call:offer', {
        callId: this.currentCallId,
        targetUserId: this.callState.contactId,
        offer: this.peer.localDescription,
      });
    } catch (err) {
      console.error('handleCallAnswer', err);
      this.endCall();
    }
  }

  private async handleCallOffer(payload: unknown) {
    const d = payload as Record<string, unknown>;
    if (d.callId !== this.currentCallId || !this.callState.isIncoming) return;
    try {
      if (!this.peer) await this.createPeerConnection();
      const offer = d.offer as RTCSessionDescription;
      await this.peer!.setRemoteDescription(new RTCSessionDescription(offer));
      if (!this.localStream) {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: this.callState.callType === 'video' ? { width: 640, height: 480 } : false,
        });
        this.localStream = stream;
        this.emit('localStream', stream);
      }
      this.localStream!.getTracks().forEach((t) => this.peer!.addTrack(t, this.localStream!));
      const answer = await this.peer!.createAnswer();
      await this.peer!.setLocalDescription(answer);
      this.socket?.emit('call:webrtc-answer', {
        callId: this.currentCallId,
        targetUserId: (d.userId as string) ?? this.currentInitiatorId,
        answer: this.peer!.localDescription,
      });
      this.updateState({ status: 'connected', isIncoming: false });
      this.startDurationTimer();
    } catch (err) {
      console.error('handleCallOffer', err);
      this.endCall();
    }
  }

  private async handleWebRTCAnswer(payload: unknown) {
    const d = payload as Record<string, unknown>;
    if (d.callId !== this.currentCallId) return;
    try {
      if (this.peer && d.answer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(d.answer as RTCSessionDescription));
        this.updateState({ status: 'connected' });
        this.startDurationTimer();
      }
    } catch (err) {
      console.error('handleWebRTCAnswer', err);
      this.endCall();
    }
  }

  private async handleIceCandidate(payload: unknown) {
    const d = payload as Record<string, unknown>;
    if (d.callId !== this.currentCallId || !this.peer) return;
    try {
      if (d.candidate) {
        await this.peer.addIceCandidate(new RTCIceCandidate(d.candidate as RTCIceCandidate));
      }
    } catch (err) {
      console.error('handleIceCandidate', err);
    }
  }

  private handleCallEnd() {
    this.endCall();
  }

  async answerCall() {
    if (!this.callState.isIncoming) throw new Error('No incoming call');
    if (!this.currentCallId) throw new Error('Call id missing');
    await apiClient.put(`/calls/${this.currentCallId}/answer`);
    this.socket?.emit('call:answer', {
      callId: this.currentCallId,
      initiatorId: this.currentInitiatorId,
    });
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: this.callState.callType === 'video' ? { width: 640, height: 480 } : false,
    });
    this.localStream = stream;
    this.emit('localStream', stream);
    await this.createPeerConnection();
    if (this.peer && this.localStream) {
      this.localStream.getTracks().forEach((t) => this.peer!.addTrack(t, this.localStream!));
    }
    this.updateState({ status: 'calling', isIncoming: false });
  }

  endCall() {
    if (this.currentCallId) {
      const me = getCurrentUserId();
      const participants =
        me && this.currentInitiatorId
          ? this.callState.isIncoming
            ? [this.currentInitiatorId, me]
            : [me, this.callState.contactId]
          : [this.callState.contactId];
      apiClient.put(`/calls/${this.currentCallId}/end`).catch(() => {});
      this.socket?.emit('call:end', { callId: this.currentCallId, participants });
    }
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.remoteStream?.getTracks().forEach((t) => t.stop());
    this.remoteStream = null;
    this.peer?.close();
    this.peer = null;
    this.currentCallId = null;
    this.currentInitiatorId = null;
    this.updateState({ isActive: false, status: 'ended', duration: 0 });
    this.emit('callEnded', null);
  }

  toggleMute() {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = this.callState.isMuted;
    });
    this.updateState({ isMuted: !this.callState.isMuted });
  }

  toggleVideo() {
    if (this.callState.callType !== 'video') return;
    this.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = this.callState.isVideoOff;
    });
    this.updateState({ isVideoOff: !this.callState.isVideoOff });
  }

  toggleSpeaker() {
    this.updateState({ isSpeakerOn: !this.callState.isSpeakerOn });
  }
}

let manager: CallManager | null = null;

export function getCallManager(): CallManager {
  if (!manager) manager = new CallManager();
  return manager;
}
