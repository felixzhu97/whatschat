import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCallManager } from "../../rtc/infrastructure/call-manager-impl";
import type { RTCCallConfig, RTCPeerHandle } from "../domain/adapters";

const createMockPeerHandle = (): RTCPeerHandle => ({
  addTrack: vi.fn(),
  createOffer: vi.fn().mockResolvedValue({ type: "offer", sdp: "mock-sdp" }),
  createAnswer: vi.fn().mockResolvedValue({ type: "answer", sdp: "mock-sdp" }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  getLocalDescription: vi.fn(() => ({ type: "offer", sdp: "mock" })),
  getRemoteDescription: vi.fn(() => null),
  getSignalingState: vi.fn(() => "stable"),
  setOnIceCandidate: vi.fn(),
  setOnTrack: vi.fn(),
  setOnConnectionStateChange: vi.fn(),
});

const createMockConfig = (): RTCCallConfig => ({
  signaling: {
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
  },
  media: {
    createPeerConnection: vi.fn(() => createMockPeerHandle()),
    getUserMedia: vi.fn().mockResolvedValue({ 
      getTracks: vi.fn(() => []),
      getAudioTracks: vi.fn(() => []),
      getVideoTracks: vi.fn(() => []),
    }),
    fromPlainSessionDesc: vi.fn((desc) => desc),
    fromPlainIceCandidate: vi.fn((c) => c),
    stopStream: vi.fn(),
    getAudioTracks: vi.fn(() => []),
    getVideoTracks: vi.fn(() => []),
    setTrackEnabled: vi.fn(),
  },
  api: {
    createCall: vi.fn().mockResolvedValue({ callId: "test-call-id" }),
    answerCall: vi.fn().mockResolvedValue(undefined),
    endCall: vi.fn().mockResolvedValue(undefined),
  },
  getCurrentUserId: vi.fn(() => "user-1"),
});

describe("createCallManager", () => {
  let config: RTCCallConfig;
  let manager: ReturnType<typeof createCallManager>;

  beforeEach(() => {
    config = createMockConfig();
    manager = createCallManager(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("factory function", () => {
    it("should return an ICallManager instance", () => {
      expect(manager).toBeDefined();
      expect(typeof manager.on).toBe("function");
      expect(typeof manager.off).toBe("function");
      expect(typeof manager.getCallState).toBe("function");
      expect(typeof manager.getLocalStream).toBe("function");
      expect(typeof manager.getRemoteStream).toBe("function");
      expect(typeof manager.startCall).toBe("function");
      expect(typeof manager.answerCall).toBe("function");
      expect(typeof manager.endCall).toBe("function");
      expect(typeof manager.toggleMute).toBe("function");
      expect(typeof manager.toggleVideo).toBe("function");
      expect(typeof manager.toggleSpeaker).toBe("function");
    });
  });

  describe("initialization", () => {
    it("should set up signaling listeners", () => {
      expect(config.signaling.on).toHaveBeenCalledTimes(6);
    });

    it("should register call:incoming handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:incoming", expect.any(Function));
    });

    it("should register call:answer handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:answer", expect.any(Function));
    });

    it("should register call:offer handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:offer", expect.any(Function));
    });

    it("should register call:webrtc-answer handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:webrtc-answer", expect.any(Function));
    });

    it("should register call:ice-candidate handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:ice-candidate", expect.any(Function));
    });

    it("should register call:end handler", () => {
      expect(config.signaling.on).toHaveBeenCalledWith("call:end", expect.any(Function));
    });
  });

  describe("getCallState", () => {
    it("should return initial state with isActive false", () => {
      const state = manager.getCallState();
      expect(state.isActive).toBe(false);
    });

    it("should return initial state with ended status", () => {
      const state = manager.getCallState();
      expect(state.status).toBe("ended");
    });

    it("should return initial state with duration 0", () => {
      const state = manager.getCallState();
      expect(state.duration).toBe(0);
    });

    it("should return initial state with voice callType", () => {
      const state = manager.getCallState();
      expect(state.callType).toBe("voice");
    });

    it("should return initial state with isIncoming false", () => {
      const state = manager.getCallState();
      expect(state.isIncoming).toBe(false);
    });

    it("should return initial state with empty contact info", () => {
      const state = manager.getCallState();
      expect(state.contactId).toBe("");
      expect(state.contactName).toBe("");
      expect(state.contactAvatar).toBe("");
    });

    it("should return a new object each time", () => {
      const state1 = manager.getCallState();
      const state2 = manager.getCallState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe("getLocalStream", () => {
    it("should return null initially", () => {
      expect(manager.getLocalStream()).toBeNull();
    });
  });

  describe("getRemoteStream", () => {
    it("should return null initially", () => {
      expect(manager.getRemoteStream()).toBeNull();
    });
  });

  describe("event listeners", () => {
    it("should allow registering callbacks", () => {
      const callback = vi.fn();
      manager.on("callStateChanged", callback);
      expect(config.signaling.on).toHaveBeenCalled();
    });

    it("should handle multiple event registrations", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      manager.on("callStateChanged", cb1);
      manager.on("callStateChanged", cb2);
      expect(config.signaling.on).toHaveBeenCalled();
    });
  });

  describe("setSocket", () => {
    it("should call signaling.setSocket if available", () => {
      const mockSignaling = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
        setSocket: vi.fn(),
      };
      const localConfig = { ...config, signaling: mockSignaling };
      const localManager = createCallManager(localConfig);
      localManager.setSocket?.({});
      expect(mockSignaling.setSocket).toHaveBeenCalledWith({});
    });
  });

  describe("startCall", () => {
    it("should create call via API", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice");
      expect(config.api.createCall).toHaveBeenCalledWith({
        type: "AUDIO",
        targetUserId: "contact-1",
      });
    });

    it("should send signaling message", async () => {
      await manager.startCall("contact-1", "Contact", "avatar.jpg", "voice");
      expect(config.signaling.send).toHaveBeenCalledWith("call:incoming", expect.objectContaining({
        targetUserId: "contact-1",
        type: "voice",
        callerName: "Contact",
        callerAvatar: "avatar.jpg",
      }));
    });

    it("should get user media for voice call", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice");
      expect(config.media.getUserMedia).toHaveBeenCalledWith(false);
    });

    it("should get user media for video call", async () => {
      await manager.startCall("contact-1", "Contact", "", "video");
      expect(config.media.getUserMedia).toHaveBeenCalledWith(true);
    });

    it("should update call state to calling", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice");
      const state = manager.getCallState();
      expect(state.isActive).toBe(true);
      expect(state.status).toBe("calling");
      expect(state.contactId).toBe("contact-1");
    });

    it("should emit localStream event", async () => {
      const callback = vi.fn();
      manager.on("localStream", callback);
      await manager.startCall("contact-1", "Contact", "", "voice");
      expect(callback).toHaveBeenCalled();
    });

    it("should use chatId from options if provided", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice", { chatId: "chat-123" });
      expect(config.api.createCall).toHaveBeenCalledWith({
        type: "AUDIO",
        chatId: "chat-123",
      });
    });

    it("should use VIDEO type for video calls", async () => {
      await manager.startCall("contact-1", "Contact", "", "video");
      expect(config.api.createCall).toHaveBeenCalledWith(
        expect.objectContaining({ type: "VIDEO" })
      );
    });

    it("should handle API failure", async () => {
      (config.api.createCall as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("API Error")
      );
      await expect(
        manager.startCall("contact-1", "Contact", "", "voice")
      ).rejects.toThrow("API Error");
    });
  });

  describe("answerCall", () => {
    it("should throw if no incoming call", async () => {
      await expect(manager.answerCall()).rejects.toThrow("No incoming call");
    });

    it("should send answer signaling", async () => {
      // Simulate incoming call
      const incomingHandler = config.signaling.on.mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      incomingHandler?.({
        data: {
          callId: "call-123",
          initiatorId: "caller-1",
          callerName: "Caller",
          type: "voice",
        },
      });

      await manager.answerCall();
      expect(config.signaling.send).toHaveBeenCalledWith(
        "call:answer",
        expect.objectContaining({ callId: "call-123" })
      );
    });

    it("should get user media when answering", async () => {
      const incomingHandler = config.signaling.on.mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      incomingHandler?.({
        data: {
          callId: "call-123",
          initiatorId: "caller-1",
          callerName: "Caller",
          type: "voice",
        },
      });

      await manager.answerCall();
      expect(config.media.getUserMedia).toHaveBeenCalled();
    });
  });

  describe("endCall", () => {
    it("should not throw", () => {
      expect(() => manager.endCall()).not.toThrow();
    });

    it("should send end signaling when call is active", async () => {
      // First start a call
      await manager.startCall("contact-1", "Contact", "", "voice");
      manager.endCall();
      expect(config.signaling.send).toHaveBeenCalledWith(
        "call:end",
        expect.objectContaining({ callId: "test-call-id" })
      );
    });

    it("should call API endCall when call is active", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice");
      manager.endCall();
      expect(config.api.endCall).toHaveBeenCalledWith("test-call-id");
    });

    it("should reset state after ending", async () => {
      await manager.startCall("contact-1", "Contact", "", "voice");
      manager.endCall();
      const state = manager.getCallState();
      expect(state.isActive).toBe(false);
      expect(state.status).toBe("ended");
      expect(state.duration).toBe(0);
    });

    it("should emit callEnded event", () => {
      const callback = vi.fn();
      manager.on("callEnded", callback);
      manager.endCall();
      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe("toggleMute", () => {
    it("should not throw when no local stream", () => {
      expect(() => manager.toggleMute()).not.toThrow();
    });

    it("should toggle without error", () => {
      expect(() => manager.toggleMute()).not.toThrow();
    });
  });

  describe("toggleVideo", () => {
    it("should not throw for voice call", () => {
      expect(() => manager.toggleVideo()).not.toThrow();
    });

    it("should not throw for video call even without tracks", async () => {
      await manager.startCall("contact-1", "Contact", "", "video");
      expect(() => manager.toggleVideo()).not.toThrow();
    });
  });

  describe("toggleSpeaker", () => {
    it("should toggle speaker state", () => {
      const initialState = manager.getCallState();
      manager.toggleSpeaker();
      const newState = manager.getCallState();
      expect(newState.isSpeakerOn).not.toBe(initialState.isSpeakerOn);
    });
  });

  describe("handleCallIncoming", () => {
    it("should update state for incoming call", () => {
      const incomingHandler = config.signaling.on.mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      
      incomingHandler?.({
        data: {
          callId: "call-456",
          initiatorId: "caller-2",
          callerName: "Test Caller",
          callerAvatar: "avatar.jpg",
          type: "video",
        },
      });

      const state = manager.getCallState();
      expect(state.isActive).toBe(true);
      expect(state.isIncoming).toBe(true);
      expect(state.contactId).toBe("caller-2");
      expect(state.contactName).toBe("Test Caller");
      expect(state.callType).toBe("video");
      expect(state.status).toBe("ringing");
    });

    it("should emit incomingCall event", () => {
      const callback = vi.fn();
      manager.on("incomingCall", callback);
      
      const incomingHandler = config.signaling.on.mock.calls.find(
        (call) => call[0] === "call:incoming"
      )?.[1];
      
      incomingHandler?.({
        data: {
          callId: "call-789",
          initiatorId: "caller-3",
          callerName: "Another",
          type: "voice",
        },
      });

      expect(callback).toHaveBeenCalled();
    });
  });
});

describe("createCallManager peer connection", () => {
  it("should initialize with signaling handlers", () => {
    const localConfig = createMockConfig();
    const manager = createCallManager(localConfig);
    expect(manager).toBeDefined();
    expect(typeof manager.getCallState).toBe("function");
  });
});

describe("createCallManager ICE handling", () => {
  it("should queue ICE candidates when remote description not set", async () => {
    const config = createMockConfig();
    let iceHandler: ((candidate: RTCIceCandidateInit | null) => void) | null = null;
    
    (config.media.createPeerConnection as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      ...createMockPeerHandle(),
      setOnIceCandidate: vi.fn((cb) => { iceHandler = cb; }),
      setOnTrack: vi.fn(),
      setOnConnectionStateChange: vi.fn(),
      getRemoteDescription: vi.fn(() => null),
    }));

    const manager = createCallManager(config);
    await manager.startCall("contact-1", "Contact", "", "voice");
    
    // Trigger ICE candidate before remote description is set
    iceHandler?.({
      candidate: "candidate:1",
      sdpMid: "0",
      sdpMLineIndex: 0,
    });

    // Should not add to peer connection yet
    expect(config.media.fromPlainIceCandidate).not.toHaveBeenCalled();
  });
});

describe("createCallManager error handling", () => {
  it("should handle getUserMedia failure in startCall", async () => {
    const config = createMockConfig();
    (config.media.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Permission denied")
    );
    
    const manager = createCallManager(config);
    await expect(
      manager.startCall("contact-1", "Contact", "", "voice")
    ).rejects.toThrow();
  });

  it("should handle API failure in answerCall", async () => {
    const config = createMockConfig();
    
    // Simulate incoming call first
    (config.api.createCall as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      callId: "call-123",
    });
    
    const manager = createCallManager(config);
    await manager.startCall("contact-1", "Contact", "", "voice");
    
    // Now make answerCall fail
    (config.api.answerCall as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Answer failed")
    );
    
    // Trigger incoming call handler manually
    const incomingHandler = config.signaling.on.mock.calls.find(
      (call) => call[0] === "call:incoming"
    )?.[1];
    incomingHandler?.({
      data: {
        callId: "call-123",
        initiatorId: "caller-1",
        callerName: "Caller",
        type: "voice",
      },
    });

    await expect(manager.answerCall()).rejects.toThrow();
  });
});
