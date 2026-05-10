import { describe, it, expect, vi } from "vitest";
import type { RTCSignalingAdapter,
  RTCMediaAdapter,
  RTCPeerHandle,
  RTCApiAdapter,
  RTCCallConfig,
} from "../../rtc/domain/adapters";

describe("RTC Adapters Type Definitions", () => {
  describe("RTCSignalingAdapter", () => {
    it("should have on method", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };
      expect(typeof adapter.on).toBe("function");
    });

    it("should have off method", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };
      expect(typeof adapter.off).toBe("function");
    });

    it("should have send method", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };
      expect(typeof adapter.send).toBe("function");
    });

    it("should allow optional setSocket", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
        setSocket: vi.fn(),
      };
      expect(typeof adapter.setSocket).toBe("function");
    });

    it("should accept event handlers", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };

      const handler = vi.fn();
      adapter.on("offer", handler);
      expect(adapter.on).toHaveBeenCalledWith("offer", handler);
    });

    it("should allow sending payloads", () => {
      const adapter: RTCSignalingAdapter = {
        on: vi.fn(),
        off: vi.fn(),
        send: vi.fn(),
      };

      adapter.send("offer", { sdp: "test", type: "offer" });
      expect(adapter.send).toHaveBeenCalledWith("offer", { sdp: "test", type: "offer" });
    });
  });

  describe("RTCMediaAdapter", () => {
    it("should have createPeerConnection method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.createPeerConnection).toBe("function");
    });

    it("should have getUserMedia method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.getUserMedia).toBe("function");
    });

    it("should have fromPlainSessionDesc method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.fromPlainSessionDesc).toBe("function");
    });

    it("should have fromPlainIceCandidate method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.fromPlainIceCandidate).toBe("function");
    });

    it("should have stopStream method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.stopStream).toBe("function");
    });

    it("should have getAudioTracks method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.getAudioTracks).toBe("function");
    });

    it("should have getVideoTracks method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.getVideoTracks).toBe("function");
    });

    it("should have setTrackEnabled method", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn(),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };
      expect(typeof adapter.setTrackEnabled).toBe("function");
    });

    it("should accept ICE servers configuration", () => {
      const adapter: RTCMediaAdapter = {
        createPeerConnection: vi.fn((iceServers: RTCIceServer[]) => {
          expect(iceServers).toBeDefined();
          expect(Array.isArray(iceServers)).toBe(true);
          return {} as RTCPeerHandle;
        }),
        getUserMedia: vi.fn(),
        fromPlainSessionDesc: vi.fn(),
        fromPlainIceCandidate: vi.fn(),
        stopStream: vi.fn(),
        getAudioTracks: vi.fn(() => []),
        getVideoTracks: vi.fn(() => []),
        setTrackEnabled: vi.fn(),
      };

      const iceServers: RTCIceServer[] = [
        { urls: "stun:stun.l.google.com:19302" },
      ];
      adapter.createPeerConnection(iceServers);
    });
  });

  describe("RTCPeerHandle", () => {
    it("should have addTrack method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.addTrack).toBe("function");
    });

    it("should have createOffer method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.createOffer).toBe("function");
    });

    it("should have createAnswer method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.createAnswer).toBe("function");
    });

    it("should have setLocalDescription method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.setLocalDescription).toBe("function");
    });

    it("should have setRemoteDescription method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.setRemoteDescription).toBe("function");
    });

    it("should have addIceCandidate method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.addIceCandidate).toBe("function");
    });

    it("should have close method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.close).toBe("function");
    });

    it("should have getLocalDescription method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.getLocalDescription).toBe("function");
    });

    it("should have getRemoteDescription method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.getRemoteDescription).toBe("function");
    });

    it("should have getSignalingState method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.getSignalingState).toBe("function");
    });

    it("should have setOnIceCandidate method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.setOnIceCandidate).toBe("function");
    });

    it("should have setOnTrack method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.setOnTrack).toBe("function");
    });

    it("should have setOnConnectionStateChange method", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };
      expect(typeof handle.setOnConnectionStateChange).toBe("function");
    });

    it("should accept ICE candidate callback", () => {
      const handle: RTCPeerHandle = {
        addTrack: vi.fn(),
        createOffer: vi.fn(),
        createAnswer: vi.fn(),
        setLocalDescription: vi.fn(),
        setRemoteDescription: vi.fn(),
        addIceCandidate: vi.fn(),
        close: vi.fn(),
        getLocalDescription: vi.fn(() => null),
        getRemoteDescription: vi.fn(),
        getSignalingState: vi.fn(() => "stable"),
        setOnIceCandidate: vi.fn(),
        setOnTrack: vi.fn(),
        setOnConnectionStateChange: vi.fn(),
      };

      const callback = vi.fn();
      handle.setOnIceCandidate(callback);
      expect(handle.setOnIceCandidate).toHaveBeenCalledWith(callback);
    });
  });

  describe("RTCApiAdapter", () => {
    it("should have createCall method", () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };
      expect(typeof adapter.createCall).toBe("function");
    });

    it("should have answerCall method", () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };
      expect(typeof adapter.answerCall).toBe("function");
    });

    it("should have endCall method", () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };
      expect(typeof adapter.endCall).toBe("function");
    });

    it("createCall should accept call parameters", async () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn().mockResolvedValue({ callId: "call-123" }),
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      const result = await adapter.createCall({
        type: "voice",
        targetUserId: "user-1",
        chatId: "chat-1",
      });

      expect(result.callId).toBe("call-123");
      expect(adapter.createCall).toHaveBeenCalledWith({
        type: "voice",
        targetUserId: "user-1",
        chatId: "chat-1",
      });
    });

    it("createCall should return participants", async () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn().mockResolvedValue({
          callId: "call-456",
          participants: [{ userId: "user-1" }, { userId: "user-2" }],
        }),
        answerCall: vi.fn(),
        endCall: vi.fn(),
      };

      const result = await adapter.createCall({ type: "video" });
      expect(result.participants).toHaveLength(2);
    });

    it("answerCall should accept callId", async () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn().mockResolvedValue(undefined),
        endCall: vi.fn(),
      };

      await adapter.answerCall("call-123");
      expect(adapter.answerCall).toHaveBeenCalledWith("call-123");
    });

    it("endCall should accept callId", async () => {
      const adapter: RTCApiAdapter = {
        createCall: vi.fn(),
        answerCall: vi.fn(),
        endCall: vi.fn().mockResolvedValue(undefined),
      };

      await adapter.endCall("call-123");
      expect(adapter.endCall).toHaveBeenCalledWith("call-123");
    });
  });

  describe("RTCCallConfig", () => {
    it("should require signaling adapter", () => {
      const config: RTCCallConfig = {
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
        media: {
          createPeerConnection: vi.fn(),
          getUserMedia: vi.fn(),
          fromPlainSessionDesc: vi.fn(),
          fromPlainIceCandidate: vi.fn(),
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
        getCurrentUserId: vi.fn(() => "user-1"),
      };

      expect(config.signaling).toBeDefined();
      expect(typeof config.signaling.on).toBe("function");
    });

    it("should require media adapter", () => {
      const config: RTCCallConfig = {
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
        media: {
          createPeerConnection: vi.fn(),
          getUserMedia: vi.fn(),
          fromPlainSessionDesc: vi.fn(),
          fromPlainIceCandidate: vi.fn(),
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
        getCurrentUserId: vi.fn(() => "user-1"),
      };

      expect(config.media).toBeDefined();
      expect(typeof config.media.createPeerConnection).toBe("function");
    });

    it("should require api adapter", () => {
      const config: RTCCallConfig = {
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
        media: {
          createPeerConnection: vi.fn(),
          getUserMedia: vi.fn(),
          fromPlainSessionDesc: vi.fn(),
          fromPlainIceCandidate: vi.fn(),
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
        getCurrentUserId: vi.fn(() => "user-1"),
      };

      expect(config.api).toBeDefined();
      expect(typeof config.api.createCall).toBe("function");
    });

    it("should require getCurrentUserId function", () => {
      const config: RTCCallConfig = {
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
        media: {
          createPeerConnection: vi.fn(),
          getUserMedia: vi.fn(),
          fromPlainSessionDesc: vi.fn(),
          fromPlainIceCandidate: vi.fn(),
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
        getCurrentUserId: vi.fn(() => "user-1"),
      };

      expect(typeof config.getCurrentUserId).toBe("function");
      expect(config.getCurrentUserId()).toBe("user-1");
    });

    it("getCurrentUserId should return null when not logged in", () => {
      const config: RTCCallConfig = {
        signaling: {
          on: vi.fn(),
          off: vi.fn(),
          send: vi.fn(),
        },
        media: {
          createPeerConnection: vi.fn(),
          getUserMedia: vi.fn(),
          fromPlainSessionDesc: vi.fn(),
          fromPlainIceCandidate: vi.fn(),
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
        getCurrentUserId: vi.fn(() => null),
      };

      expect(config.getCurrentUserId()).toBeNull();
    });
  });
});
