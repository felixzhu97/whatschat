import { describe, it, expect } from "vitest";
import { Group } from "@/src/domain/entities/group.entity";

describe("Group Entity", () => {
  const defaultMembers = [
    {
      userId: "user-1",
      userName: "User One",
      userAvatar: "https://example.com/user1.jpg",
      role: "owner" as const,
      joinedAt: "2024-01-01T00:00:00Z",
    },
    {
      userId: "user-2",
      userName: "User Two",
      userAvatar: "https://example.com/user2.jpg",
      role: "admin" as const,
      joinedAt: "2024-01-02T00:00:00Z",
    },
    {
      userId: "user-3",
      userName: "User Three",
      userAvatar: "https://example.com/user3.jpg",
      role: "member" as const,
      joinedAt: "2024-01-03T00:00:00Z",
    },
  ];

  const defaultSettings = {
    whoCanSendMessages: "everyone" as const,
    whoCanEditGroupInfo: "everyone" as const,
    whoCanAddMembers: "everyone" as const,
    disappearingMessages: false,
    disappearingMessagesDuration: 0,
  };

  describe("create", () => {
    it("should create a group with required fields", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "https://example.com/group.jpg",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2"],
        settings: defaultSettings,
      });

      expect(group.id).toBe("group-1");
      expect(group.name).toBe("Test Group");
      expect(group.avatar).toBe("https://example.com/group.jpg");
      expect(group.createdBy).toBe("user-1");
      expect(group.createdAt).toBe("2024-01-01T00:00:00Z");
      expect(group.members).toHaveLength(3);
      expect(group.admins).toEqual(["user-2"]);
      expect(group.settings).toEqual(defaultSettings);
    });

    it("should create a group with optional fields", () => {
      const group = Group.create({
        id: "group-2",
        name: "Team Group",
        avatar: "https://example.com/team.jpg",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2"],
        settings: defaultSettings,
        description: "A team for work",
        inviteLink: "https://example.com/invite/abc123",
      });

      expect(group.description).toBe("A team for work");
      expect(group.inviteLink).toBe("https://example.com/invite/abc123");
    });
  });

  describe("addMember", () => {
    it("should add a new member to the group", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers.slice(0, 2),
        admins: [],
        settings: defaultSettings,
      });

      const newMember = {
        userId: "user-4",
        userName: "User Four",
        userAvatar: "https://example.com/user4.jpg",
        role: "member" as const,
        joinedAt: "2024-01-04T00:00:00Z",
      };

      const updatedGroup = group.addMember(newMember);

      expect(updatedGroup.members).toHaveLength(3);
      expect(updatedGroup.members[2]).toEqual(newMember);
    });

    it("should preserve existing members", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2"],
        settings: defaultSettings,
      });

      const newMember = {
        userId: "user-4",
        userName: "User Four",
        userAvatar: "",
        role: "member" as const,
        joinedAt: "2024-01-04T00:00:00Z",
      };

      const updatedGroup = group.addMember(newMember);

      expect(updatedGroup.members[0]).toEqual(defaultMembers[0]);
      expect(updatedGroup.members[1]).toEqual(defaultMembers[1]);
      expect(updatedGroup.members[2]).toEqual(defaultMembers[2]);
    });

    it("should return new instance", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const newMember = {
        userId: "user-4",
        userName: "User Four",
        userAvatar: "",
        role: "member" as const,
        joinedAt: "2024-01-04T00:00:00Z",
      };

      const updatedGroup = group.addMember(newMember);

      expect(updatedGroup).not.toBe(group);
    });
  });

  describe("removeMember", () => {
    it("should remove a member from the group", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2"],
        settings: defaultSettings,
      });

      const updatedGroup = group.removeMember("user-3");

      expect(updatedGroup.members).toHaveLength(2);
      expect(updatedGroup.members.find((m) => m.userId === "user-3")).toBeUndefined();
    });

    it("should also remove member from admins", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2", "user-3"],
        settings: defaultSettings,
      });

      const updatedGroup = group.removeMember("user-2");

      expect(updatedGroup.admins).not.toContain("user-2");
      expect(updatedGroup.admins).toContain("user-3");
    });

    it("should preserve other members", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: ["user-2"],
        settings: defaultSettings,
      });

      const updatedGroup = group.removeMember("user-3");

      expect(updatedGroup.members[0]).toEqual(defaultMembers[0]);
      expect(updatedGroup.members[1]).toEqual(defaultMembers[1]);
    });

    it("should return new instance", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.removeMember("user-3");

      expect(updatedGroup).not.toBe(group);
    });
  });

  describe("updateSettings", () => {
    it("should update whoCanSendMessages", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateSettings({
        whoCanSendMessages: "admins",
      });

      expect(updatedGroup.settings.whoCanSendMessages).toBe("admins");
      expect(updatedGroup.settings.whoCanEditGroupInfo).toBe(defaultSettings.whoCanEditGroupInfo);
    });

    it("should update whoCanEditGroupInfo", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateSettings({
        whoCanEditGroupInfo: "admins",
      });

      expect(updatedGroup.settings.whoCanEditGroupInfo).toBe("admins");
    });

    it("should update disappearingMessages", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateSettings({
        disappearingMessages: true,
        disappearingMessagesDuration: 3600,
      });

      expect(updatedGroup.settings.disappearingMessages).toBe(true);
      expect(updatedGroup.settings.disappearingMessagesDuration).toBe(3600);
    });

    it("should update multiple settings at once", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateSettings({
        whoCanSendMessages: "admins",
        whoCanEditGroupInfo: "admins",
        whoCanAddMembers: "admins",
      });

      expect(updatedGroup.settings.whoCanSendMessages).toBe("admins");
      expect(updatedGroup.settings.whoCanEditGroupInfo).toBe("admins");
      expect(updatedGroup.settings.whoCanAddMembers).toBe("admins");
    });

    it("should return new instance", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateSettings({
        whoCanSendMessages: "admins",
      });

      expect(updatedGroup).not.toBe(group);
    });
  });

  describe("updateInfo", () => {
    it("should update group name", () => {
      const group = Group.create({
        id: "group-1",
        name: "Old Name",
        avatar: "https://example.com/old.jpg",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateInfo("New Name");

      expect(updatedGroup.name).toBe("New Name");
      expect(updatedGroup.avatar).toBe("https://example.com/old.jpg");
    });

    it("should update group description", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
        description: "Old description",
      });

      const updatedGroup = group.updateInfo("Test Group", "New description");

      expect(updatedGroup.description).toBe("New description");
    });

    it("should update group avatar", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "https://example.com/old.jpg",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateInfo("Test Group", undefined, "https://example.com/new.jpg");

      expect(updatedGroup.avatar).toBe("https://example.com/new.jpg");
    });

    it("should update all info at once", () => {
      const group = Group.create({
        id: "group-1",
        name: "Old Name",
        avatar: "https://example.com/old.jpg",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateInfo(
        "New Name",
        "New description",
        "https://example.com/new.jpg"
      );

      expect(updatedGroup.name).toBe("New Name");
      expect(updatedGroup.description).toBe("New description");
      expect(updatedGroup.avatar).toBe("https://example.com/new.jpg");
    });

    it("should return new instance", () => {
      const group = Group.create({
        id: "group-1",
        name: "Test Group",
        avatar: "",
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        members: defaultMembers,
        admins: [],
        settings: defaultSettings,
      });

      const updatedGroup = group.updateInfo("New Name");

      expect(updatedGroup).not.toBe(group);
    });
  });
});
