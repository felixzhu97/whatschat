"use client";

import {
  IWebRTCAdapter,
  RTCCallState,
} from "../../../domain/interfaces/adapters/webrtc.interface";
import { getWebSocketAdapter } from "./websocket.adapter";
import type { IWebSocketAdapter } from "../../../domain/interfaces/adapters/websocket.interface";

/**
 * Chime WebRTC Adapter using AWS Chime SDK
 * This adapter requires amazon-chime-sdk-js package
 */
export class ChimeWebRTCAdapter implements IWebRTCAdapter {
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private wsManager: IWebSocketAdapter;
  private listeners: Map<string, Function[]> = new Map();
  private callState: RTCCallState = {
    isActive: false,
    isIncoming: false,
    contactId: "",
    contactName: "",
    contactAvatar: "",
    callType: "voice",
    status: "ended",
    duration: 0,
    isMuted: false,
    isVideoOff: false,
    isSpeakerOn: false,
  };
  private durationTimer: NodeJS.Timeout | null = null;
  private meetingId: string | null = null;
  private attendeeId: string | null = null;
  private meetingSession: any = null; // Chime SDK MeetingSession
  private audioVideo: any = null; // Chime SDK AudioVideoFacade

  constructor(wsManager?: IWebSocketAdapter) {
    this.wsManager = wsManager || getWebSocketAdapter();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    this.wsManager.on("chime:meeting-created", this.handleMeetingCreated.bind(this));
    this.wsManager.on("chime:attendee-created", this.handleAttendeeCreated.bind(this));
    this.wsManager.on("chime:attendee-joined", this.handleAttendeeJoined.bind(this));
    this.wsManager.on("chime:attendee-left", this.handleAttendeeLeft.bind(this));
    this.wsManager.on("chime:meeting-ended", this.handleMeetingEnded.bind(this));
  }

  private async initializeChimeSDK() {
    // Dynamically import Chime SDK
    try {
      const chimeSDK = await import("amazon-chime-sdk-js");
      return chimeSDK;
    } catch (error) {
      console.error("Failed to load Chime SDK. Please install amazon-chime-sdk-js:", error);
      throw new Error("Chime SDK not available");
    }
  }

  private async handleMeetingCreated(data: any) {
    try {
      const { meeting, attendee } = data;
      this.meetingId = meeting.meetingId;
      this.attendeeId = attendee.attendeeId;

      const chimeSDK = await this.initializeChimeSDK();
      
      // Create meeting session
      const logger = new chimeSDK.ConsoleLogger("ChimeLogger", chimeSDK.LogLevel.INFO);
      const deviceController = new chimeSDK.DefaultDeviceController(logger);
      
      const configuration = new chimeSDK.MeetingSessionConfiguration(
        meeting,
        attendee
      );

      this.meetingSession = new chimeSDK.DefaultMeetingSession(
        configuration,
        logger,
        deviceController
      );

      this.audioVideo = this.meetingSession.audioVideo;

      // Set up audio/video observers
      this.setupAudioVideoObservers();

      // Start local video/audio
      await this.startLocalVideo();
      await this.startLocalAudio();

      this.updateCallState({ status: "connected" });
      this.startDurationTimer();
    } catch (error) {
      console.error("Failed to initialize Chime meeting:", error);
      this.endCall();
      throw error;
    }
  }

  private async handleAttendeeCreated(data: any) {
    const { meeting, attendee } = data;
    this.meetingId = meeting.meetingId;
    this.attendeeId = attendee.attendeeId;

    // Initialize meeting session
    await this.handleMeetingCreated(data);
  }

  private handleAttendeeJoined(data: any) {
    console.log("Attendee joined:", data);
    // Remote stream will be handled by audioVideo observers
  }

  private handleAttendeeLeft(data: any) {
    console.log("Attendee left:", data);
    this.remoteStreams.delete(data.attendeeId);
    this.emit("remoteStreamRemoved", data.attendeeId);
  }

  private handleMeetingEnded(data: any) {
    console.log("Meeting ended:", data);
    this.endCall();
  }

  private setupAudioVideoObservers() {
    if (!this.audioVideo) return;

    // Observer for remote video tiles
    const observer = {
      videoTileDidUpdate: (tileState: any) => {
        if (tileState.boundAttendeeId && tileState.tileId && !tileState.localTile) {
          // Get remote video stream
          this.audioVideo.bindVideoElement(tileState.tileId, null);
          
          // Note: Chime SDK doesn't expose MediaStream directly
          // You need to bind to a video element
          const videoElement = document.createElement("video");
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          this.audioVideo.bindVideoElement(tileState.tileId, videoElement);
          
          // Create a MediaStream from the video element
          const stream = new MediaStream();
          if (videoElement.srcObject) {
            const tracks = (videoElement.srcObject as MediaStream).getTracks();
            tracks.forEach((track) => stream.addTrack(track));
            this.remoteStreams.set(tileState.boundAttendeeId, stream);
            this.emit("remoteStream", stream);
          }
        }
      },
      videoTileWasRemoved: (tileId: number) => {
        // Handle tile removal
        console.log("Video tile removed:", tileId);
      },
      audioVideoDidStart: () => {
        console.log("Audio/Video started");
        this.updateCallState({ status: "connected" });
      },
      audioVideoDidStop: () => {
        console.log("Audio/Video stopped");
      },
    };

    this.audioVideo.addObserver(observer);
  }

  private async startLocalVideo(): Promise<void> {
    if (!this.audioVideo || this.callState.callType === "voice") {
      return;
    }

    try {
      const videoInputDevices = await this.audioVideo.listVideoInputDevices();
      if (videoInputDevices.length > 0) {
        await this.audioVideo.startLocalVideoTile();
        this.updateCallState({ isVideoOff: false });
      }
    } catch (error) {
      console.error("Failed to start local video:", error);
    }
  }

  private async startLocalAudio(): Promise<void> {
    if (!this.audioVideo) {
      return;
    }

    try {
      const audioInputDevices = await this.audioVideo.listAudioInputDevices();
      if (audioInputDevices.length > 0) {
        await this.audioVideo.start();
        this.updateCallState({ isMuted: false });
      }
    } catch (error) {
      console.error("Failed to start local audio:", error);
    }
  }

  async startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video"
  ): Promise<void> {
    try {
      this.updateCallState({
        isActive: true,
        isIncoming: false,
        contactId,
        contactName,
        contactAvatar,
        callType,
        status: "calling",
        isVideoOff: callType === "voice",
      });

      // Request meeting creation from backend via WebSocket
      this.wsManager.send({
        type: "chime:create-meeting",
        to: "server",
        data: {
          externalMeetingId: `call-${contactId}-${Date.now()}`,
        },
        timestamp: Date.now(),
      });

      // Also request to join the meeting
      // The backend will create the meeting and send back meeting info
    } catch (error) {
      console.error("Failed to start call:", error);
      this.endCall();
      throw error;
    }
  }

  async answerCall(): Promise<void> {
    try {
      if (!this.callState.isIncoming || !this.meetingId) {
        throw new Error("No incoming call to answer");
      }

      // Request to join the meeting
      this.wsManager.send({
        type: "chime:join-meeting",
        to: "server",
        data: {
          meetingId: this.meetingId,
        },
        timestamp: Date.now(),
      });

      this.updateCallState({ status: "connected", isIncoming: false });
      this.startDurationTimer();
    } catch (error) {
      console.error("Failed to answer call:", error);
      this.endCall();
      throw error;
    }
  }

  endCall(): void {
    if (this.audioVideo) {
      try {
        this.audioVideo.stop();
        this.audioVideo.stopLocalVideoTile();
      } catch (error) {
        console.error("Error stopping audio/video:", error);
      }
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.remoteStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    this.remoteStreams.clear();

    if (this.meetingId) {
      // Notify backend about leaving
      this.wsManager.send({
        type: "chime:leave-meeting",
        to: "server",
        data: {
          meetingId: this.meetingId,
          attendeeId: this.attendeeId,
        },
        timestamp: Date.now(),
      });
    }

    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    this.updateCallState({
      isActive: false,
      status: "ended",
      duration: 0,
    });

    this.meetingId = null;
    this.attendeeId = null;
    this.meetingSession = null;
    this.audioVideo = null;

    this.emit("callEnded", null);
  }

  toggleMute(): void {
    if (!this.audioVideo) {
      return;
    }

    const isMuted = !this.callState.isMuted;
    if (isMuted) {
      this.audioVideo.realtimeMuteLocalAudio();
    } else {
      this.audioVideo.realtimeUnmuteLocalAudio();
    }

    this.updateCallState({ isMuted });
  }

  toggleVideo(): void {
    if (!this.audioVideo || this.callState.callType === "voice") {
      return;
    }

    const isVideoOff = !this.callState.isVideoOff;
    if (isVideoOff) {
      this.audioVideo.stopLocalVideoTile();
    } else {
      this.audioVideo.startLocalVideoTile();
    }

    this.updateCallState({ isVideoOff });
  }

  toggleSpeaker(): void {
    this.updateCallState({ isSpeakerOn: !this.callState.isSpeakerOn });
    // Chime SDK handles audio output automatically
  }

  private startDurationTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
    }

    this.durationTimer = setInterval(() => {
      this.updateCallState({ duration: this.callState.duration + 1 });
    }, 1000);
  }

  private updateCallState(updates: Partial<RTCCallState>) {
    this.callState = { ...this.callState, ...updates };
    this.emit("callStateChanged", this.callState);
  }

  getCallState(): RTCCallState {
    return { ...this.callState };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    // Return first remote stream if available
    const firstStream = this.remoteStreams.values().next().value;
    return firstStream || null;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  setSimulatedMode(enabled: boolean): void {
    // Chime adapter doesn't support simulated mode
    // Fall back to regular WebRTC adapter if simulation is needed
    console.warn("Chime adapter doesn't support simulated mode");
  }
}

// Factory function
export const createChimeWebRTCAdapter = (
  wsManager?: IWebSocketAdapter
): IWebRTCAdapter => {
  return new ChimeWebRTCAdapter(wsManager);
};
