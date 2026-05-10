import { describe, it, expect } from "vitest";
import { Group, ParticipantRole, GroupParticipant, GroupSettings } from "@/domain/entities/group.entity";

describe("Group Entity", () => {
  describe("constructor", () => {
    it("should create a group with all required fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-01");
      const group = new Group(
        "group-1",
        "Test Group",
        "creator-1",
        "A test group description",
        "https://example.com/group.jpg",
        [],
        {
          onlyAdminsCanSendMessages: true,
          onlyAdminsCanEditInfo: true,
          onlyAdminsCanAddParticipants: false,
        },
        createdAt,
        updatedAt
      );

      expect(group.id).toBe("group-1");
      expect(group.name).toBe("Test Group");
      expect(group.creatorId).toBe("creator-1");
      expect(group.description).toBe("A test group description");
      expect(group.avatar).toBe("https://example.com/group.jpg");
      expect(group.settings.onlyAdminsCanSendMessages).toBe(true);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(true);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
    });

    it("should use default values for optional fields", () => {
      const group = new Group("group-1", "Test Group", "creator-1");

      expect(group.description).toBeUndefined();
      expect(group.avatar).toBeUndefined();
      expect(group.participants).toEqual([]);
      expect(group.settings.onlyAdminsCanSendMessages).toBe(false);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(false);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
      expect(group.createdAt).toBeInstanceOf(Date);
      expect(group.updatedAt).toBeInstanceOf(Date);
    });

    it("should accept participants array", () => {
      const participants: GroupParticipant[] = [
        { userId: "user-1", role: "ADMIN", joinedAt: new Date() },
        { userId: "user-2", role: "MEMBER", joinedAt: new Date() },
      ];
      const group = new Group("group-1", "Test Group", "creator-1", undefined, undefined, participants);

      expect(group.participants).toHaveLength(2);
      expect(group.participants[0].userId).toBe("user-1");
      expect(group.participants[0].role).toBe("ADMIN");
    });
  });

  describe("Group.create", () => {
    it("should create a group with provided data", () => {
      const createdAt = new Date("2024-01-01");
      const participants: GroupParticipant[] = [
        { userId: "user-1", role: "ADMIN", joinedAt: createdAt },
      ];
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: false,
        onlyAdminsCanAddParticipants: true,
      };

      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        description: "Description",
        avatar: "https://example.com/avatar.jpg",
        participants,
        settings,
        createdAt,
        updatedAt: createdAt,
      });

      expect(group.id).toBe("group-1");
      expect(group.name).toBe("Test Group");
      expect(group.creatorId).toBe("creator-1");
      expect(group.description).toBe("Description");
      expect(group.avatar).toBe("https://example.com/avatar.jpg");
      expect(group.participants).toHaveLength(1);
      expect(group.settings.onlyAdminsCanSendMessages).toBe(true);
    });

    it("should use default settings when not provided", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
      });

      expect(group.settings.onlyAdminsCanSendMessages).toBe(false);
      expect(group.settings.onlyAdminsCanEditInfo).toBe(false);
      expect(group.settings.onlyAdminsCanAddParticipants).toBe(false);
    });

    it("should use default empty participants array when not provided", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
      });

      expect(group.participants).toEqual([]);
    });

    it("should set dates when not provided", () => {
      const beforeCreate = new Date();
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
      });

      expect(group.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
      expect(group.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
    });
  });

  describe("addParticipant", () => {
    it("should add a new participant to the group", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
      });

      const updatedGroup = group.addParticipant("user-2", "user-1", "MEMBER");

      expect(updatedGroup.participants).toHaveLength(2);
      expect(updatedGroup.participants[1].userId).toBe("user-2");
      expect(updatedGroup.participants[1].role).toBe("MEMBER");
      expect(updatedGroup.participants[1].addedBy).toBe("user-1");
    });

    it("should use MEMBER as default role", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
      });

      const updatedGroup = group.addParticipant("user-2", "user-1");

      expect(updatedGroup.participants[0].role).toBe("MEMBER");
    });

    it("should not add duplicate participant", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
      });

      const updatedGroup = group.addParticipant("user-1", "creator-1", "ADMIN");

      expect(updatedGroup.participants).toHaveLength(1);
      expect(updatedGroup).toBe(group);
    });

    it("should preserve original group unchanged", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
      });

      const updatedGroup = group.addParticipant("user-1", "creator-1");

      expect(group.participants).toHaveLength(0);
      expect(updatedGroup.participants).toHaveLength(1);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        createdAt,
        updatedAt: createdAt,
      });

      const beforeUpdate = new Date();
      const updatedGroup = group.addParticipant("user-1", "creator-1");

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });

    it("should preserve existing participants when adding new one", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
      });

      const updatedGroup = group.addParticipant("user-2", "creator-1");

      expect(updatedGroup.participants[0].userId).toBe("user-1");
      expect(updatedGroup.participants[1].userId).toBe("user-2");
    });
  });

  describe("removeParticipant", () => {
    it("should remove a participant from the group", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [
          { userId: "user-1", role: "ADMIN", joinedAt: new Date() },
          { userId: "user-2", role: "MEMBER", joinedAt: new Date() },
        ],
      });

      const updatedGroup = group.removeParticipant("user-2");

      expect(updatedGroup.participants).toHaveLength(1);
      expect(updatedGroup.participants[0].userId).toBe("user-1");
    });

    it("should preserve original group unchanged", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
      });

      const updatedGroup = group.removeParticipant("user-1");

      expect(group.participants).toHaveLength(1);
      expect(updatedGroup.participants).toHaveLength(0);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
        createdAt,
        updatedAt: createdAt,
      });

      const beforeUpdate = new Date();
      const updatedGroup = group.removeParticipant("user-1");

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });

    it("should handle removing non-existent participant", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "ADMIN", joinedAt: new Date() }],
      });

      const updatedGroup = group.removeParticipant("non-existent");

      expect(updatedGroup.participants).toHaveLength(1);
    });
  });

  describe("promoteToAdmin", () => {
    it("should promote a member to admin", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "MEMBER", joinedAt: new Date() }],
      });

      const updatedGroup = group.promoteToAdmin("user-1");

      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });

    it("should preserve original group unchanged", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "MEMBER", joinedAt: new Date() }],
      });

      const updatedGroup = group.promoteToAdmin("user-1");

      expect(group.participants[0].role).toBe("MEMBER");
      expect(updatedGroup.participants[0].role).toBe("ADMIN");
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [{ userId: "user-1", role: "MEMBER", joinedAt: new Date() }],
        createdAt,
        updatedAt: createdAt,
      });

      const beforeUpdate = new Date();
      const updatedGroup = group.promoteToAdmin("user-1");

      expect(updatedGroup.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });

    it("should only update the specified participant", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        creatorId: "creator-1",
        participants: [
          { userId: "user-1", role: "MEMBER", joinedAt: new Date() },
          { userId: "user-2", role: "MEMBER", joinedAt: new Date() },
        ],
      });

      const updatedGroup = group.promoteToAdmin("user-1");

      expect(updatedGroup.participants[0].role).toBe("ADMIN");
      expect(updatedGroup.participants[1].role).toBe("MEMBER");
    });
  });

  describe("type definitions", () => {
    it("should have valid ParticipantRole type", () => {
      const adminRole: ParticipantRole = "ADMIN";
      const memberRole: ParticipantRole = "MEMBER";

      expect(adminRole).toBe("ADMIN");
      expect(memberRole).toBe("MEMBER");
    });

    it("should allow role assignment in GroupParticipant", () => {
      const participant: GroupParticipant = {
        userId: "user-1",
        role: "ADMIN",
        joinedAt: new Date(),
        addedBy: "creator-1",
      };

      expect(participant.role).toBe("ADMIN");
      expect(participant.addedBy).toBe("creator-1");
    });

    it("should allow optional addedBy in GroupParticipant", () => {
      const participant: GroupParticipant = {
        userId: "user-1",
        role: "MEMBER",
        joinedAt: new Date(),
      };

      expect(participant.addedBy).toBeUndefined();
    });

    it("should have valid GroupSettings structure", () => {
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: false,
        onlyAdminsCanAddParticipants: true,
      };

      expect(settings.onlyAdminsCanSendMessages).toBe(true);
      expect(settings.onlyAdminsCanEditInfo).toBe(false);
      expect(settings.onlyAdminsCanAddParticipants).toBe(true);
    });
  });
});
