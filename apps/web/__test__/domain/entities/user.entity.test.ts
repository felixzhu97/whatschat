import { describe, it, expect } from "vitest";
import { User } from "@/src/domain/entities/user.entity";

describe("User Entity", () => {
  describe("create", () => {
    it("should create a user with required fields", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      expect(user.id).toBe("user-1");
      expect(user.username).toBe("johndoe");
      expect(user.email).toBe("john@example.com");
      expect(user.isOnline).toBe(false);
    });

    it("should create a user with all optional fields", () => {
      const user = User.create({
        id: "user-2",
        username: "janedoe",
        email: "jane@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "online",
        name: "Jane Doe",
        about: "Hello world",
        isOnline: true,
        lastSeen: new Date("2024-01-15T10:30:00Z"),
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z"),
      });

      expect(user.id).toBe("user-2");
      expect(user.username).toBe("janedoe");
      expect(user.email).toBe("jane@example.com");
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("online");
      expect(user.name).toBe("Jane Doe");
      expect(user.about).toBe("Hello world");
      expect(user.isOnline).toBe(true);
      expect(user.lastSeen).toEqual(new Date("2024-01-15T10:30:00Z"));
      expect(user.createdAt).toEqual(new Date("2024-01-01T00:00:00Z"));
      expect(user.updatedAt).toEqual(new Date("2024-01-15T10:30:00Z"));
    });

    it("should use default values for optional fields", () => {
      const user = User.create({
        id: "user-3",
        username: "testuser",
        email: "test@example.com",
      });

      expect(user.isOnline).toBe(false);
      expect(user.lastSeen).toBeInstanceOf(Date);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle string lastSeen", () => {
      const user = User.create({
        id: "user-4",
        username: "testuser",
        email: "test@example.com",
        lastSeen: "2024-01-15T10:30:00Z",
      });

      expect(user.lastSeen).toBe("2024-01-15T10:30:00Z");
    });
  });

  describe("updateStatus", () => {
    it("should update user status", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateStatus("busy");

      expect(updatedUser.status).toBe("busy");
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.username).toBe(user.username);
      expect(updatedUser.email).toBe(user.email);
    });

    it("should return new instance with updated timestamp", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      });

      const updatedUser = user.updateStatus("away");

      expect(updatedUser.updatedAt).not.toEqual(user.updatedAt);
    });
  });

  describe("setOnline", () => {
    it("should set user online status to true", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        isOnline: false,
      });

      const onlineUser = user.setOnline(true);

      expect(onlineUser.isOnline).toBe(true);
      expect(onlineUser.id).toBe(user.id);
    });

    it("should set user online status to false", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        isOnline: true,
      });

      const offlineUser = user.setOnline(false);

      expect(offlineUser.isOnline).toBe(false);
    });

    it("should update lastSeen timestamp when going offline", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        isOnline: true,
      });

      const offlineUser = user.setOnline(false);

      expect(offlineUser.lastSeen).toBeInstanceOf(Date);
    });
  });

  describe("updateProfile", () => {
    it("should update username", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({ username: "newjohn" });

      expect(updatedUser.username).toBe("newjohn");
      expect(updatedUser.email).toBe(user.email);
    });

    it("should update name", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        name: "John Doe",
      });

      const updatedUser = user.updateProfile({ name: "John Smith" });

      expect(updatedUser.name).toBe("John Smith");
    });

    it("should update about", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({ about: "New bio" });

      expect(updatedUser.about).toBe("New bio");
    });

    it("should update avatar", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({ avatar: "https://new.com/avatar.jpg" });

      expect(updatedUser.avatar).toBe("https://new.com/avatar.jpg");
    });

    it("should update status", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({ status: "DND" });

      expect(updatedUser.status).toBe("DND");
    });

    it("should keep existing values when not provided", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        name: "John Doe",
        avatar: "https://old.com/avatar.jpg",
        about: "Old bio",
        status: "online",
      });

      const updatedUser = user.updateProfile({ name: "John Smith" });

      expect(updatedUser.username).toBe(user.username);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.name).toBe("John Smith");
      expect(updatedUser.avatar).toBe(user.avatar);
      expect(updatedUser.about).toBe(user.about);
      expect(updatedUser.status).toBe(user.status);
    });

    it("should update multiple fields at once", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({
        username: "newjohn",
        name: "New Name",
        about: "New bio",
        avatar: "https://new.com/avatar.jpg",
        status: "busy",
      });

      expect(updatedUser.username).toBe("newjohn");
      expect(updatedUser.name).toBe("New Name");
      expect(updatedUser.about).toBe("New bio");
      expect(updatedUser.avatar).toBe("https://new.com/avatar.jpg");
      expect(updatedUser.status).toBe("busy");
    });

    it("should return new instance", () => {
      const user = User.create({
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
      });

      const updatedUser = user.updateProfile({ name: "New Name" });

      expect(updatedUser).not.toBe(user);
    });
  });
});
