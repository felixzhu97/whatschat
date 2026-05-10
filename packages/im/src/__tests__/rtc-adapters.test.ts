import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  RTCSignalingAdapter,
  RTCMediaAdapter,
  RTCPeerHandle,
  RTCApiAdapter,
  RTCCallConfig,
} from "../rtc/domain/adapters";

describe("RTCSignalingAdapter", () => {
  describe("when all methods are implemented", () => {
    it("should define all required methods", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
        setSocket: vi.fn(),
      };

      expect(typeof adapter.on).toBe("function");
      expect(typeof adapter.off).toBe("function");
      expect(typeof adapter.send).toBe("function");
      expect(typeof adapter.setSocket).toBe("function");
    });

    it("should handle event registration", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = {
        on,
        off: vi.fn(),
        send: vi.fn(),
      };

      const handler = vi.fn();
      adapter.on("call:incoming", handler);
      expect(on).toHaveBeenCalledWith("call:incoming", handler);
    });

    it("should handle event unregistration", () => {
      const off = vi.fn();
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off,
        send: vi.fn(),
      };

      const handler = vi.fn();
      adapter.off("call:end", handler);
      expect(off).toHaveBeenCalledWith("call:end", handler);
    });

    it("should handle sending messages", () => {
      const send = vi.fn();
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send,
      };

      adapter.send("call:offer", { callId: "123", targetUserId: "user-1" });
      expect(send).toHaveBeenCalledWith("call:offer", {
        callId: "123",
        targetUserId: "user-1",
      });
    });
  });

  describe("when setSocket is optional", () => {
    it("should work without setSocket implementation", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };

      expect(typeof adapter.setSocket).toBe("undefined");
    });

    it("should allow adapter without setSocket to still be valid", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };

      expect(adapter.on).toBeDefined();
      expect(adapter.off).toBeDefined();
      expect(adapter.send).toBeDefined();
    });
  });

  describe("event types", () => {
    it("should support call:incoming event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:incoming", vi.fn());
      expect(on).toHaveBeenCalledWith("call:incoming", expect.any(Function));
    });

    it("should support call:answer event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:answer", vi.fn());
      expect(on).toHaveBeenCalledWith("call:answer", expect.any(Function));
    });

    it("should support call:offer event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:offer", vi.fn());
      expect(on).toHaveBeenCalledWith("call:offer", expect.any(Function));
    });

    it("should support call:webrtc-answer event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:webrtc-answer", vi.fn());
      expect(on).toHaveBeenCalledWith("call:webrtc-answer", expect.any(Function));
    });

    it("should support call:ice-candidate event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:ice-candidate", vi.fn());
      expect(on).toHaveBeenCalledWith("call:ice-candidate", expect.any(Function));
    });

    it("should support call:end event", () => {
      const on = vi.fn();
      const adapter: RTCSignalingAdapter = { on, off: vi.fn(), send: vi.fn() };

      adapter.on("call:end", vi.fn());
      expect(on).toHaveBeenCalledWith("call:end", expect.any(Function));
    });
  });

  describe("send message payloads", () => {
    it("should send call:incoming with correct payload", () => {
      const send = vi.fn();
      const adapter: RTCSignalingAdapter = { on: vi.fn(), off: vi.fn(), send };

      adapter.send("call:incoming", {
        targetUserId: "user-2",
        callId: "call-123",
        type: "voice",
        callerName: "John",
        callerAvatar: "https://example.com/avatar.jpg",
      });

      expect(send).toHaveBeenCalledWith(
        "call:incoming",
        expect.objectContaining({
          targetUserId: "user-2",
          callId: "call-123",
          type: "voice",
          callerName: "John",
        })
      );
    });

    it("should send call:answer with callId", () => {
      const send = vi.fn();
      const adapter: RTCSignalingAdapter = { on: vi.fn(), off: vi.fn(), send };

      adapter.send("call:answer", { callId: "call-456", initiatorId: "user-1" });

      expect(send).toHaveBeenCalledWith("call:answer", {
        callId: "call-456",
        initiatorId: "user-1",
      });
    });

    it("should send call:offer with SDP offer", () => {
      const send = vi.fn();
      const adapter: RTCSignalingAdapter = { on: vi.fn(), off: vi.fn(), send };

      const offer = { type: "offer", sdp: "v=0\no=..." };
      adapter.send("call:offer", {
        callId: "call-789",
        targetUserId: "user-3",
        offer,
      });

      expect(send).toHaveBeenCalledWith("call:offer", expect.objectContaining({
        callId: "call-789",
        offer,
      }));
    });

    it("should send call:ice-candidate with candidate", () => {
      const send = vi.fn();
      const adapter: RTCSignalingAdapter = { on: vi.fn(), off: vi.fn(), send };

      const candidate = { candidate: "abc123", sdpMid: "0", sdpMLineIndex: 0 };
      adapter.send("call:ice-candidate", {
        callId: "call-abc",
        targetUserId: "user-4",
        candidate,
      });

      expect(send).toHaveBeenCalledWith("call:ice-candidate", expect.objectContaining({
        candidate,
      }));
    });
  });
});

describe("RTCMediaAdapter", () => {
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

  describe("when all methods are implemented", () => {
    it("should define all required methods", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(() => createMockPeerConnection()),
        getUserMedia: vi.fn(() => Promise.resolve({})),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      expect(typeof adapter.createPeerConnection).toBe("function");
      expect(typeof adapter.getUserMedia).toBe("function");
      expect(typeof adapter.fromPlainSessionDesc).toBe("function");
      expect(typeof adapter.fromPlainIceCandidate).toBe("function");
      expect(typeof adapter.stopStream).toBe("function");
      expect(typeof adapter.getAudioTracks).toBe("function");
      expect(typeof adapter.getVideoTracks).toBe("function");
      expect(typeof adapter.setTrackEnabled).toBe("function");
    });

    it("should create peer connection with ice servers", () => {
      const createPeerConnection = vi.fn(() => createMockPeerConnection());
      const adapter: RTCMediaAdapter = {
        createPeerConnection,
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const iceServers: RTCIceServer[] = [{ urls: "stun:stun.example.com" }];
      adapter.createPeerConnection(iceServers);
      expect(createPeerConnection).toHaveBeenCalledWith(iceServers);
    });

    it("should get user media for video", async () => {
      const getUserMedia = vi.fn(() => Promise.resolve({}));
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia,
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      await adapter.getUserMedia(true);
      expect(getUserMedia).toHaveBeenCalledWith(true);
    });

    it("should get user media for audio only", async () => {
      const getUserMedia = vi.fn(() => Promise.resolve({}));
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia,
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      await adapter.getUserMedia(false);
      expect(getUserMedia).toHaveBeenCalledWith(false);
    });

    it("should convert session description", () => {
      const fromPlainSessionDesc = vi.fn((init) => init);
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc,
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const desc = { type: "offer", sdp: "v=0\no=..." };
      adapter.fromPlainSessionDesc(desc);
      expect(fromPlainSessionDesc).toHaveBeenCalledWith(desc);
    });

    it("should convert ICE candidate", () => {
      const fromPlainIceCandidate = vi.fn((init) => init);
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate,
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const candidate = { candidate: "abc", sdpMid: "0", sdpMLineIndex: 0 };
      adapter.fromPlainIceCandidate(candidate);
      expect(fromPlainIceCandidate).toHaveBeenCalledWith(candidate);
    });

    it("should stop stream", () => {
      const stopStream = vi.fn();
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream,
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const stream = {};
      adapter.stopStream(stream);
      expect(stopStream).toHaveBeenCalledWith(stream);
    });

    it("should get audio tracks from stream", () => {
      const getAudioTracks = vi.fn(() => [{ id: "audio-1", kind: "audio" }]);
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks,
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const stream = {};
      const tracks = adapter.getAudioTracks(stream);
      expect(getAudioTracks).toHaveBeenCalledWith(stream);
      expect(tracks).toHaveLength(1);
    });

    it("should get video tracks from stream", () => {
      const getVideoTracks = vi.fn(() => [{ id: "video-1", kind: "video" }]);
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks,
        setTrackEnabled: vi.fn(),
      };

      const stream = {};
      const tracks = adapter.getVideoTracks(stream);
      expect(getVideoTracks).toHaveBeenCalledWith(stream);
      expect(tracks).toHaveLength(1);
    });

    it("should enable/disable track", () => {
      const setTrackEnabled = vi.fn();
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled,
      };

      const track = {};
      adapter.setTrackEnabled(track, false);
      expect(setTrackEnabled).toHaveBeenCalledWith(track, false);
    });
  });

  describe("getUserMedia behavior", () => {
    it("should resolve with stream object", async () => {
      const mockStream = { id: "stream-1", getTracks: vi.fn(() => []) };
      const getUserMedia = vi.fn(() => Promise.resolve(mockStream));
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia,
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const result = await adapter.getUserMedia(true);
      expect(result).toBe(mockStream);
    });

    it("should reject on permission denied", async () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(() => Promise.reject(new Error("Permission denied"))),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      await expect(adapter.getUserMedia(true)).rejects.toThrow("Permission denied");
    });
  });

  describe("track operations", () => {
    it("should return empty array when no audio tracks", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const tracks = adapter.getAudioTracks({});
      expect(tracks).toHaveLength(0);
    });

    it("should return empty array when no video tracks", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const tracks = adapter.getVideoTracks({});
      expect(tracks).toHaveLength(0);
    });

    it("should enable track", () => {
      const setTrackEnabled = vi.fn();
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn((init) => init),
        fromPlainIceCandidate: vi.fn((init) => init),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled,
      };

      const track = {};
      adapter.setTrackEnabled(track, true);
      expect(setTrackEnabled).toHaveBeenCalledWith(track, true);
    });
  });
});

describe("RTCPeerHandle", () => {
  const createPeerHandle = (): RTCPeerHandle => ({
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

  describe("initialization", () => {
    it("should define all required methods", () => {
      const peer = createPeerHandle();

      expect(typeof peer.addTrack).toBe("function");
      expect(typeof peer.createOffer).toBe("function");
      expect(typeof peer.createAnswer).toBe("function");
      expect(typeof peer.setLocalDescription).toBe("function");
      expect(typeof peer.setRemoteDescription).toBe("function");
      expect(typeof peer.addIceCandidate).toBe("function");
      expect(typeof peer.close).toBe("function");
      expect(typeof peer.getLocalDescription).toBe("function");
      expect(typeof peer.getRemoteDescription).toBe("function");
      expect(typeof peer.getSignalingState).toBe("function");
      expect(typeof peer.setOnIceCandidate).toBe("function");
      expect(typeof peer.setOnTrack).toBe("function");
      expect(typeof peer.setOnConnectionStateChange).toBe("function");
    });
  });

  describe("offer/answer operations", () => {
    it("should create offer", async () => {
      const createOffer = vi.fn(() => Promise.resolve({ type: "offer", sdp: "v=0\no=..." }));
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        createOffer,
      };

      const offer = await peer.createOffer();
      expect(createOffer).toHaveBeenCalled();
      expect(offer.type).toBe("offer");
    });

    it("should create answer", async () => {
      const createAnswer = vi.fn(() => Promise.resolve({ type: "answer", sdp: "v=0\no=..." }));
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        createAnswer,
      };

      const answer = await peer.createAnswer();
      expect(createAnswer).toHaveBeenCalled();
      expect(answer.type).toBe("answer");
    });

    it("should set local description", async () => {
      const setLocalDescription = vi.fn(() => Promise.resolve());
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setLocalDescription,
      };

      const desc = { type: "offer", sdp: "v=0" };
      await peer.setLocalDescription(desc);
      expect(setLocalDescription).toHaveBeenCalledWith(desc);
    });

    it("should set remote description", async () => {
      const setRemoteDescription = vi.fn(() => Promise.resolve());
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setRemoteDescription,
      };

      const desc = { type: "offer", sdp: "v=0" };
      await peer.setRemoteDescription(desc);
      expect(setRemoteDescription).toHaveBeenCalledWith(desc);
    });

    it("should reject on invalid SDP", async () => {
      const setLocalDescription = vi.fn(() => Promise.reject(new Error("Invalid SDP")));
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setLocalDescription,
      };

      await expect(peer.setLocalDescription({ type: "offer", sdp: "" })).rejects.toThrow("Invalid SDP");
    });
  });

  describe("ICE candidate handling", () => {
    it("should add ICE candidate", async () => {
      const addIceCandidate = vi.fn(() => Promise.resolve());
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        addIceCandidate,
      };

      const candidate = { candidate: "abc", sdpMid: "0", sdpMLineIndex: 0 };
      await peer.addIceCandidate(candidate);
      expect(addIceCandidate).toHaveBeenCalledWith(candidate);
    });

    it("should register ICE candidate handler", () => {
      const setOnIceCandidate = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setOnIceCandidate,
      };

      const handler = vi.fn();
      peer.setOnIceCandidate(handler);
      expect(setOnIceCandidate).toHaveBeenCalledWith(handler);
    });

    it("should handle null ICE candidate (end of candidates)", () => {
      const addIceCandidate = vi.fn(() => Promise.resolve());
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        addIceCandidate,
      };

      peer.setOnIceCandidate((candidate) => {
        if (candidate === null) {
          addIceCandidate(null);
        }
      });

      expect(typeof peer.setOnIceCandidate).toBe("function");
    });
  });

  describe("track handling", () => {
    it("should add track to peer connection", () => {
      const addTrack = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        addTrack,
      };

      const track = {};
      const stream = {};
      peer.addTrack(track, stream);
      expect(addTrack).toHaveBeenCalledWith(track, stream);
    });

    it("should register track handler", () => {
      const setOnTrack = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setOnTrack,
      };

      const handler = vi.fn();
      peer.setOnTrack(handler);
      expect(setOnTrack).toHaveBeenCalledWith(handler);
    });

    it("should receive stream via track handler", () => {
      const setOnTrack = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setOnTrack,
      };

      const handler = vi.fn();
      peer.setOnTrack(handler);

      const mockStream = { id: "stream-1" };
      handler(mockStream);

      expect(setOnTrack).toHaveBeenCalled();
    });
  });

  describe("connection state handling", () => {
    it("should register connection state change handler", () => {
      const setOnConnectionStateChange = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        setOnConnectionStateChange,
      };

      const handler = vi.fn();
      peer.setOnConnectionStateChange(handler);
      expect(setOnConnectionStateChange).toHaveBeenCalledWith(handler);
    });

    it("should return signaling state", () => {
      const getSignalingState = vi.fn(() => "stable");
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getSignalingState,
      };

      expect(peer.getSignalingState()).toBe("stable");
      expect(getSignalingState).toHaveBeenCalled();
    });

    it("should return have-remote-offer state", () => {
      const getSignalingState = vi.fn(() => "have-remote-offer");
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getSignalingState,
      };

      expect(peer.getSignalingState()).toBe("have-remote-offer");
    });
  });

  describe("description getters", () => {
    it("should return local description", () => {
      const getLocalDescription = vi.fn(() => ({ type: "offer", sdp: "v=0\no=..." }));
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getLocalDescription,
      };

      const desc = peer.getLocalDescription();
      expect(desc?.type).toBe("offer");
      expect(getLocalDescription).toHaveBeenCalled();
    });

    it("should return null when no local description", () => {
      const getLocalDescription = vi.fn(() => null);
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getLocalDescription,
      };

      expect(peer.getLocalDescription()).toBeNull();
    });

    it("should return remote description", () => {
      const getRemoteDescription = vi.fn(() => ({ type: "answer", sdp: "v=0\no=..." }));
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getRemoteDescription,
      };

      const desc = peer.getRemoteDescription();
      expect(desc).toBeDefined();
    });

    it("should return null when no remote description", () => {
      const getRemoteDescription = vi.fn(() => null);
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        getRemoteDescription,
      };

      expect(peer.getRemoteDescription()).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("should close peer connection", () => {
      const close = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        close,
      };

      peer.close();
      expect(close).toHaveBeenCalled();
    });

    it("should allow closing multiple times", () => {
      const close = vi.fn();
      const peer: RTCPeerHandle = {
        ...createPeerHandle(),
        close,
      };

      peer.close();
      peer.close();
      expect(close).toHaveBeenCalledTimes(2);
    });
  });
});

describe("RTCApiAdapter", () => {
  describe("when all methods are implemented", () => {
    it("should define all required methods", () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(() => Promise.resolve({ callId: "123" })),
        answerCall: vi.fn(() => Promise.resolve()),
        endCall: vi.fn(() => Promise.resolve()),
      };

      expect(typeof adapter.createCall).toBe("function");
      expect(typeof adapter.answerCall).toBe("function");
      expect(typeof adapter.endCall).toBe("function");
    });
  });

  describe("createCall", () => {
    it("should create audio call", async () => {
      const createCall = vi.fn(() =>
        Promise.resolve({ callId: "call-1", participants: [] })
      );
      const adapter: RTCApiAdapter = {
        createCall,
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      const result = await adapter.createCall({
        type: "AUDIO",
        targetUserId: "user-1",
      });

      expect(createCall).toHaveBeenCalledWith({
        type: "AUDIO",
        targetUserId: "user-1",
      });
      expect(result.callId).toBe("call-1");
    });

    it("should create video call", async () => {
      const createCall = vi.fn(() =>
        Promise.resolve({ callId: "call-2", participants: [] })
      );
      const adapter: RTCApiAdapter = {
        createCall,
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      const result = await adapter.createCall({
        type: "VIDEO",
        targetUserId: "user-2",
      });

      expect(result.callId).toBe("call-2");
    });

    it("should create call with chatId", async () => {
      const createCall = vi.fn(() =>
        Promise.resolve({ callId: "call-3", participants: [] })
      );
      const adapter: RTCApiAdapter = {
        createCall,
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      await adapter.createCall({
        type: "AUDIO",
        chatId: "chat-1",
      });

      expect(createCall).toHaveBeenCalledWith({
        type: "AUDIO",
        chatId: "chat-1",
      });
    });

    it("should return participants list", async () => {
      const participants = [
        { userId: "user-1" },
        { userId: "user-2" },
      ];
      const createCall = vi.fn(() =>
        Promise.resolve({ callId: "call-4", participants })
      );
      const adapter: RTCApiAdapter = {
        createCall,
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      const result = await adapter.createCall({
        type: "AUDIO",
        targetUserId: "user-2",
      });

      expect(result.participants).toHaveLength(2);
      expect(result.participants).toContainEqual({ userId: "user-1" });
    });

    it("should reject on API error", async () => {
      const createCall = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      );
      const adapter: RTCApiAdapter = {
        createCall,
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      await expect(
        adapter.createCall({ type: "AUDIO", targetUserId: "user-1" })
      ).rejects.toThrow("Network error");
    });
  });

  describe("answerCall", () => {
    it("should answer incoming call", async () => {
      const answerCall = vi.fn(() => Promise.resolve());
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall,
        endCall: vi.fn(),
      };

      await adapter.answerCall("call-123");
      expect(answerCall).toHaveBeenCalledWith("call-123");
    });

    it("should reject on answer failure", async () => {
      const answerCall = vi.fn(() =>
        Promise.reject(new Error("Call already ended"))
      );
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall,
        endCall: vi.fn(),
      };

      await expect(adapter.answerCall("call-invalid")).rejects.toThrow(
        "Call already ended"
      );
    });
  });

  describe("endCall", () => {
    it("should end active call", async () => {
      const endCall = vi.fn(() => Promise.resolve());
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall,
      };

      await adapter.endCall("call-123");
      expect(endCall).toHaveBeenCalledWith("call-123");
    });

    it("should handle end call failure gracefully", async () => {
      const endCall = vi.fn(() => Promise.resolve());
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall,
      };

      await expect(adapter.endCall("call-123")).resolves.toBeUndefined();
    });
  });
});

describe("RTCCallConfig", () => {
  const createMockConfig = (): RTCCallConfig => ({
    signaling: {
      on: vi.fn(),
      off: vi.fn(),
      send: vi.fn(),
    },
    media: {
      createPeerConnection: vi.fn(),
      getUserMedia: vi.fn(),
      fromPlainSessionDesc: vi.fn((init) => init),
      fromPlainIceCandidate: vi.fn((init) => init),
      stopStream: vi.fn(),
      getAudioTracks: vi.fn(() => []),
      getVideoTracks: vi.fn(() => []),
      setTrackEnabled: vi.fn(),
    },
    api: {
      createCall: vi.fn(),
      answerCall: vi.fn(),
      endCall: vi.fn(),
    },
    getCurrentUserId: () => "user-1",
  });

  describe("initialization", () => {
    it("should require all adapter dependencies", () => {
      const config = createMockConfig();

      expect(config.signaling).toBeDefined();
      expect(config.media).toBeDefined();
      expect(config.api).toBeDefined();
      expect(typeof config.getCurrentUserId).toBe("function");
    });

    it("should provide current user id", () => {
      const getCurrentUserId = vi.fn(() => "user-123");
      const config: RTCCallConfig = {
        ...createMockConfig(),
        getCurrentUserId,
      };

      expect(config.getCurrentUserId()).toBe("user-123");
    });

    it("should return null when user is not logged in", () => {
      const getCurrentUserId = vi.fn(() => null);
      const config: RTCCallConfig = {
        ...createMockConfig(),
        getCurrentUserId,
      };

      expect(config.getCurrentUserId()).toBeNull();
    });
  });

  describe("signaling adapter integration", () => {
    it("should accept signaling adapter with setSocket", () => {
      const config: RTCCallConfig = {
        ...createMockConfig(),
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
          setSocket: vi.fn(),
        },
      };

      expect(config.signaling.setSocket).toBeDefined();
    });

    it("should accept signaling adapter without setSocket", () => {
      const config: RTCCallConfig = {
        ...createMockConfig(),
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
      };

      expect(config.signaling.setSocket).toBeUndefined();
    });
  });

  describe("media adapter integration", () => {
    it("should accept media adapter with all methods", () => {
      const config = createMockConfig();

      expect(typeof config.media.createPeerConnection).toBe("function");
      expect(typeof config.media.getUserMedia).toBe("function");
      expect(typeof config.media.stopStream).toBe("function");
    });
  });

  describe("api adapter integration", () => {
    it("should accept api adapter with all methods", () => {
      const config = createMockConfig();

      expect(typeof config.api.createCall).toBe("function");
      expect(typeof config.api.answerCall).toBe("function");
      expect(typeof config.api.endCall).toBe("function");
    });
  });
});
