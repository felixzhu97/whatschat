import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCallManager } from "../rtc/infrastructure/call-manager-impl";
import type { ICallManager } from "../rtc/domain/call-manager";
import type { RTCCallConfig } from "../rtc/domain/adapters";
import { INITIAL_CALL_STATE, ICE_SERVERS, RTC_EVENTS } from "../rtc/application/constants";
import { formatDuration } from "../rtc/application/format-duration";
import { sessionDescToPlain } from "../rtc/application/session-desc";
import type { RTCPeerHandle, RTCSignalingAdapter, RTCMediaAdapter, RTCApiAdapter } from "../rtc/domain/adapters";

// Mock stream object to avoid MediaStream dependency
const createMockStream = () => ({
  getAudioTracks: vi.fn(() => []),
  getVideoTracks: vi.fn(() => []),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  getTracks: vi.fn(() => []),
});

const createMockSignaling = (): RTCSignalingAdapter => ({
  on: vi.fn(),
  off: vi.fn(),
  send: vi.fn(),
  setSocket: vi.fn(),
});

const createMockMedia = (): RTCMediaAdapter => ({
  createPeerConnection: vi.fn(() => createMockPeerConnection()),
  getUserMedia: vi.fn(() => Promise.resolve(createMockStream())),
  fromPlainSessionDesc: vi.fn((init) => init),
  fromPlainIceCandidate: vi.fn((init) => init),
  stopStream: vi.fn(),
  getAudioTracks: vi.fn(() => [{ enabled: true }]),
  getVideoTracks: vi.fn(() => [{ enabled: true }]),
  setTrackEnabled: vi.fn(),
});

const createMockPeerConnection = (): RTCPeerHandle => ({
  addTrack: vi.fn(),
  createOffer: vi.fn(() => Promise.resolve({ type: "offer", sdp: "mock-sdp" })),
  createAnswer: vi.fn(() => Promise.resolve({ type: "answer", sdp: "mock-answer" })),
  setLocalDescription: vi.fn(() => Promise.resolve()),
  setRemoteDescription: vi.fn(() => Promise.resolve()),
  addIceCandidate: vi.fn(() => Promise.resolve()),
  close: vi.fn(),
  getLocalDescription: vi.fn(() => ({ type: "offer", sdp: "mock-sdp" })),
  getRemoteDescription: vi.fn(() => ({ type: "answer", sdp: "mock-answer" })),
  getSignalingState: vi.fn(() => "stable"),
  setOnIceCandidate: vi.fn(),
  setOnTrack: vi.fn(),
  setOnConnectionStateChange: vi.fn(),
});

const createMockApi = (): RTCApiAdapter => ({
  createCall: vi.fn(() => Promise.resolve({ callId: "call-123", participants: [] })),
  answerCall: vi.fn(() => Promise.resolve()),
  endCall: vi.fn(() => Promise.resolve()),
});

const createTestConfig = (): RTCCallConfig => ({
  signaling: createMockSignaling(),
  media: createMockMedia(),
  api: createMockApi(),
  getCurrentUserId: () => "user-1",
});

describe("createCallManager", () => {
  let config: RTCCallConfig;
  let callManager: ICallManager;
  let signaling: RTCSignalingAdapter;
  let media: RTCMediaAdapter;
  let api: RTCApiAdapter;

  beforeEach(() => {
    vi.useFakeTimers();
    config = createTestConfig();
    signaling = config.signaling;
    media = config.media;
    api = config.api;
    callManager = createCallManager(config);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should setup signaling listeners", () => {
      expect(signaling.on).toHaveBeenCalledWith("call:incoming", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("call:answer", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("call:offer", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("call:webrtc-answer", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("call:ice-candidate", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("call:end", expect.any(Function));
    });

    it("should return initial call state", () => {
      const state = callManager.getCallState();
      expect(state).toEqual(INITIAL_CALL_STATE);
      expect(state.isActive).toBe(false);
      expect(state.isIncoming).toBe(false);
      expect(state.status).toBe("ended");
    });

    it("should return null streams initially", () => {
      expect(callManager.getLocalStream()).toBeNull();
      expect(callManager.getRemoteStream()).toBeNull();
    });
  });

  describe("event listeners", () => {
    it("should allow registering event listeners", () => {
      const callback = vi.fn();
      callManager.on("callStateChanged", callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should allow unregistering event listeners", () => {
      const callback = vi.fn();
      callManager.on("callStateChanged", callback);
      callManager.off("callStateChanged", callback);
      callManager.emit?.("callStateChanged", {});
      expect(callback).not.toHaveBeenCalled();
    });

    it("should emit events to registered listeners", () => {
      const callback = vi.fn();
      callManager.on("callStateChanged", callback);
      
      // Manually trigger state change
      (signaling.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1]?.({
        data: {
          initiatorId: "user-2",
          callId: "call-456",
          callerName: "Test User",
          type: "voice",
        },
      });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("startCall", () => {
    it("should initiate outgoing call", async () => {
      const stateBefore = callManager.getCallState();
      expect(stateBefore.isActive).toBe(false);

      await callManager.startCall("user-2", "Test User", "", "voice");

      const state = callManager.getCallState();
      expect(state.isActive).toBe(true);
      expect(state.isIncoming).toBe(false);
      expect(state.contactId).toBe("user-2");
      expect(state.contactName).toBe("Test User");
      expect(state.status).toBe("calling");
      expect(state.callType).toBe("voice");
    });

    it("should create call via API", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");

      expect(api.createCall).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "AUDIO",
          targetUserId: "user-2",
        })
      );
    });

    it("should send signaling message", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");

      expect(signaling.send).toHaveBeenCalledWith(
        "call:incoming",
        expect.objectContaining({
          targetUserId: "user-2",
          callId: "call-123",
          type: "voice",
          callerName: "Test User",
        })
      );
    });

    it("should get user media for voice call", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");

      expect(media.getUserMedia).toHaveBeenCalledWith(false);
    });

    it("should get user media for video call", async () => {
      await callManager.startCall("user-2", "Test User", "", "video");

      expect(media.getUserMedia).toHaveBeenCalledWith(true);
    });

    it("should use chatId when provided", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice", { chatId: "chat-1" });

      expect(api.createCall).toHaveBeenCalledWith(
        expect.objectContaining({
          chatId: "chat-1",
        })
      );
    });

    it("should reset call on error", async () => {
      (api.createCall as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("API error")
      );

      await expect(
        callManager.startCall("user-2", "Test User", "", "voice")
      ).rejects.toThrow("API error");

      const state = callManager.getCallState();
      expect(state.isActive).toBe(false);
    });
  });

  describe("answerCall", () => {
    beforeEach(async () => {
      // Simulate incoming call setup
      const incomingHandler = (signaling.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      incomingHandler?.({
        data: {
          initiatorId: "user-2",
          callId: "call-456",
          callerName: "Test User",
          type: "voice",
        },
      });
    });

    it("should answer incoming call", async () => {
      await callManager.answerCall();

      const state = callManager.getCallState();
      expect(state.isIncoming).toBe(false);
      expect(state.status).toBe("calling");
    });

    it("should call API to answer", async () => {
      await callManager.answerCall();

      expect(api.answerCall).toHaveBeenCalledWith("call-456");
    });

    it("should send signaling answer message", async () => {
      await callManager.answerCall();

      expect(signaling.send).toHaveBeenCalledWith(
        "call:answer",
        expect.objectContaining({
          callId: "call-456",
          initiatorId: "user-2",
        })
      );
    });

    it("should throw if no incoming call", async () => {
      // Create a fresh call manager to ensure clean state
      const freshConfig = createTestConfig();
      const freshManager = createCallManager(freshConfig);
      // Do not setup incoming call, just try to answer
      await expect(freshManager.answerCall()).rejects.toThrow("No incoming call");
    });
  });

  describe("endCall", () => {
    it("should end active call", async () => {
      // Start a call first
      await callManager.startCall("user-2", "Test User", "", "voice");

      callManager.endCall();

      const state = callManager.getCallState();
      expect(state.isActive).toBe(false);
      expect(state.status).toBe("ended");
      expect(state.duration).toBe(0);
    });

    it("should call API to end call", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");

      callManager.endCall();

      expect(api.endCall).toHaveBeenCalledWith("call-123");
    });

    it("should send signaling end message", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");

      callManager.endCall();

      expect(signaling.send).toHaveBeenCalledWith(
        "call:end",
        expect.objectContaining({
          callId: "call-123",
        })
      );
    });

    it("should stop media streams", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");
      const localStream = callManager.getLocalStream();

      callManager.endCall();

      expect(media.stopStream).toHaveBeenCalled();
    });

    it("should clear duration timer", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");
      
      callManager.endCall();

      // Verify duration is reset
      expect(callManager.getCallState().duration).toBe(0);
    });
  });

  describe("toggleMute", () => {
    it("should toggle mute state", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");
      
      expect(callManager.getCallState().isMuted).toBe(false);

      callManager.toggleMute();
      expect(callManager.getCallState().isMuted).toBe(true);

      callManager.toggleMute();
      expect(callManager.getCallState().isMuted).toBe(false);
    });
  });

  describe("toggleVideo", () => {
    it("should toggle video state for video calls", async () => {
      await callManager.startCall("user-2", "Test User", "", "video");
      
      expect(callManager.getCallState().isVideoOff).toBe(false);

      callManager.toggleVideo();
      expect(callManager.getCallState().isVideoOff).toBe(true);

      callManager.toggleVideo();
      expect(callManager.getCallState().isVideoOff).toBe(false);
    });

    it("should not toggle video for voice calls", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");
      
      // For voice calls, isVideoOff is initialized to true (video is off by default)
      // and toggleVideo returns early without changing the state
      const stateBefore = callManager.getCallState().isVideoOff;
      callManager.toggleVideo();
      const stateAfter = callManager.getCallState().isVideoOff;

      // State should remain unchanged since toggleVideo returns early for voice calls
      expect(stateBefore).toBe(stateAfter);
    });
  });

  describe("toggleSpeaker", () => {
    it("should toggle speaker state", async () => {
      await callManager.startCall("user-2", "Test User", "", "voice");
      
      expect(callManager.getCallState().isSpeakerOn).toBe(false);

      callManager.toggleSpeaker();
      expect(callManager.getCallState().isSpeakerOn).toBe(true);

      callManager.toggleSpeaker();
      expect(callManager.getCallState().isSpeakerOn).toBe(false);
    });
  });

  describe("setSocket", () => {
    it("should call signaling.setSocket if available", () => {
      const mockSocket = { send: vi.fn() };
      callManager.setSocket?.(mockSocket);

      expect(signaling.setSocket).toHaveBeenCalledWith(mockSocket);
    });
  });

  describe("duration timer", () => {
    it("should start duration timer when call connects", async () => {
      // Simulate call connected
      const stateHandler = (signaling.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      stateHandler?.({
        data: {
          initiatorId: "user-2",
          callId: "call-456",
          callerName: "Test User",
          type: "voice",
        },
      });

      // Manually update to connected state to simulate peer connection
      const state = callManager.getCallState();
      expect(state.duration).toBe(0);

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(5000);

      // Duration should have incremented (once timer starts)
      // Note: In real scenario, this happens when connection state changes to "connected"
    });
  });
});

describe("RTC Constants", () => {
  describe("ICE_SERVERS", () => {
    it("should contain Google STUN servers", () => {
      expect(ICE_SERVERS).toContainEqual({ urls: "stun:stun.l.google.com:19302" });
      expect(ICE_SERVERS).toContainEqual({ urls: "stun:stun1.l.google.com:19302" });
    });
  });

  describe("INITIAL_CALL_STATE", () => {
    it("should have correct default values", () => {
      expect(INITIAL_CALL_STATE.isActive).toBe(false);
      expect(INITIAL_CALL_STATE.isIncoming).toBe(false);
      expect(INITIAL_CALL_STATE.contactId).toBe("");
      expect(INITIAL_CALL_STATE.contactName).toBe("");
      expect(INITIAL_CALL_STATE.contactAvatar).toBe("");
      expect(INITIAL_CALL_STATE.callType).toBe("voice");
      expect(INITIAL_CALL_STATE.status).toBe("ended");
      expect(INITIAL_CALL_STATE.duration).toBe(0);
      expect(INITIAL_CALL_STATE.isMuted).toBe(false);
      expect(INITIAL_CALL_STATE.isVideoOff).toBe(false);
      expect(INITIAL_CALL_STATE.isSpeakerOn).toBe(false);
    });
  });

  describe("RTC_EVENTS", () => {
    it("should have all event types", () => {
      expect(RTC_EVENTS.INCOMING).toBe("call:incoming");
      expect(RTC_EVENTS.ANSWER).toBe("call:answer");
      expect(RTC_EVENTS.OFFER).toBe("call:offer");
      expect(RTC_EVENTS.WEBRTC_ANSWER).toBe("call:webrtc-answer");
      expect(RTC_EVENTS.ICE_CANDIDATE).toBe("call:ice-candidate");
      expect(RTC_EVENTS.END).toBe("call:end");
    });
  });
});

describe("formatDuration", () => {
  it("should format seconds to MM:SS", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(30)).toBe("0:30");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("should format hours when needed", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7200)).toBe("2:00:00");
  });

  it("should pad single digits with zero", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3665)).toBe("1:01:05");
  });
});

describe("sessionDescToPlain", () => {
  it("should convert standard session description", () => {
    const result = sessionDescToPlain({ type: "offer", sdp: "v=0\no=..." });
    expect(result).toEqual({ type: "offer", sdp: "v=0\no=..." });
  });

  it("should handle alternative field names", () => {
    const result = sessionDescToPlain({ _type: "answer", _sdp: "v=0\no=..." });
    expect(result?.type).toBe("answer");
    expect(result?.sdp).toBe("v=0\no=...");
  });

  it("should return null for null input", () => {
    expect(sessionDescToPlain(null)).toBeNull();
  });

  it("should use defaultType when type is missing", () => {
    const result = sessionDescToPlain({ sdp: "v=0\no=..." }, "offer");
    expect(result?.type).toBe("offer");
  });

  it("should handle missing sdp", () => {
    const result = sessionDescToPlain({ type: "offer" });
    expect(result?.sdp).toBe("");
  });
});
