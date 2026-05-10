import { describe, it, expect } from "vitest";
import { Call } from "@/src/domain/entities/call.entity";

describe("Call Entity", () => {
  describe("create", () => {
    it("should create a call with required fields", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "https://example.com/avatar.jpg",
        type: "voice",
        status: "outgoing",
        startTime: "2024-01-15T10:30:00Z",
      });

      expect(call.id).toBe("call-1");
      expect(call.contactId).toBe("contact-1");
      expect(call.contactName).toBe("John Doe");
      expect(call.contactAvatar).toBe("https://example.com/avatar.jpg");
      expect(call.type).toBe("voice");
      expect(call.status).toBe("outgoing");
      expect(call.startTime).toBe("2024-01-15T10:30:00Z");
    });

    it("should create a video call", () => {
      const call = Call.create({
        id: "call-2",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "video",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      expect(call.type).toBe("video");
      expect(call.status).toBe("incoming");
    });

    it("should create a call with optional fields", () => {
      const call = Call.create({
        id: "call-3",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "ended",
        startTime: "2024-01-15T10:30:00Z",
        endTime: "2024-01-15T10:45:00Z",
        duration: 900,
        isGroup: true,
        participants: ["user-1", "user-2", "user-3"],
      });

      expect(call.endTime).toBe("2024-01-15T10:45:00Z");
      expect(call.duration).toBe(900);
      expect(call.isGroup).toBe(true);
      expect(call.participants).toEqual(["user-1", "user-2", "user-3"]);
    });

    it("should create group call", () => {
      const call = Call.create({
        id: "call-4",
        contactId: "group-1",
        contactName: "Team Group",
        contactAvatar: "",
        type: "video",
        status: "outgoing",
        startTime: "2024-01-15T10:30:00Z",
        isGroup: true,
        participants: ["user-1", "user-2"],
      });

      expect(call.isGroup).toBe(true);
      expect(call.participants).toHaveLength(2);
    });
  });

  describe("answer", () => {
    it("should change status to answered", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const answeredCall = call.answer();

      expect(answeredCall.status).toBe("answered");
    });

    it("should preserve other call properties", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "https://example.com/avatar.jpg",
        type: "video",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
        isGroup: true,
        participants: ["user-1", "user-2"],
      });

      const answeredCall = call.answer();

      expect(answeredCall.id).toBe(call.id);
      expect(answeredCall.contactId).toBe(call.contactId);
      expect(answeredCall.contactName).toBe(call.contactName);
      expect(answeredCall.contactAvatar).toBe(call.contactAvatar);
      expect(answeredCall.type).toBe(call.type);
      expect(answeredCall.startTime).toBe(call.startTime);
      expect(answeredCall.isGroup).toBe(call.isGroup);
      expect(answeredCall.participants).toEqual(call.participants);
    });

    it("should return new instance", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const answeredCall = call.answer();

      expect(answeredCall).not.toBe(call);
    });
  });

  describe("end", () => {
    it("should change status to ended with duration", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "answered",
        startTime: "2024-01-15T10:30:00Z",
      });

      const endedCall = call.end("2024-01-15T10:45:00Z", 900);

      expect(endedCall.status).toBe("ended");
      expect(endedCall.endTime).toBe("2024-01-15T10:45:00Z");
      expect(endedCall.duration).toBe(900);
    });

    it("should preserve other call properties", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "https://example.com/avatar.jpg",
        type: "video",
        status: "answered",
        startTime: "2024-01-15T10:30:00Z",
        isGroup: true,
        participants: ["user-1", "user-2"],
      });

      const endedCall = call.end("2024-01-15T10:45:00Z", 900);

      expect(endedCall.id).toBe(call.id);
      expect(endedCall.contactId).toBe(call.contactId);
      expect(endedCall.contactName).toBe(call.contactName);
      expect(endedCall.contactAvatar).toBe(call.contactAvatar);
      expect(endedCall.type).toBe(call.type);
      expect(endedCall.startTime).toBe(call.startTime);
      expect(endedCall.isGroup).toBe(call.isGroup);
      expect(endedCall.participants).toEqual(call.participants);
    });

    it("should return new instance", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "answered",
        startTime: "2024-01-15T10:30:00Z",
      });

      const endedCall = call.end("2024-01-15T10:45:00Z", 900);

      expect(endedCall).not.toBe(call);
    });

    it("should handle zero duration", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "answered",
        startTime: "2024-01-15T10:30:00Z",
      });

      const endedCall = call.end("2024-01-15T10:30:05Z", 0);

      expect(endedCall.duration).toBe(0);
    });
  });

  describe("markAsMissed", () => {
    it("should change status to missed", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const missedCall = call.markAsMissed();

      expect(missedCall.status).toBe("missed");
    });

    it("should preserve other call properties", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "https://example.com/avatar.jpg",
        type: "video",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
        isGroup: true,
        participants: ["user-1", "user-2"],
      });

      const missedCall = call.markAsMissed();

      expect(missedCall.id).toBe(call.id);
      expect(missedCall.contactId).toBe(call.contactId);
      expect(missedCall.contactName).toBe(call.contactName);
      expect(missedCall.contactAvatar).toBe(call.contactAvatar);
      expect(missedCall.type).toBe(call.type);
      expect(missedCall.startTime).toBe(call.startTime);
      expect(missedCall.isGroup).toBe(call.isGroup);
      expect(missedCall.participants).toEqual(call.participants);
    });

    it("should return new instance", () => {
      const call = Call.create({
        id: "call-1",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const missedCall = call.markAsMissed();

      expect(missedCall).not.toBe(call);
    });

    it("should work for both voice and video calls", () => {
      const voiceCall = Call.create({
        id: "call-voice",
        contactId: "contact-1",
        contactName: "John Doe",
        contactAvatar: "",
        type: "voice",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const videoCall = Call.create({
        id: "call-video",
        contactId: "contact-1",
        contactName: "Jane Doe",
        contactAvatar: "",
        type: "video",
        status: "incoming",
        startTime: "2024-01-15T10:30:00Z",
      });

      const missedVoiceCall = voiceCall.markAsMissed();
      const missedVideoCall = videoCall.markAsMissed();

      expect(missedVoiceCall.status).toBe("missed");
      expect(missedVideoCall.status).toBe("missed");
    });
  });
});
