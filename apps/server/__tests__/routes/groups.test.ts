import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import groupsRouter from "../../src/routes/groups";

describe("Groups Router", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/groups", groupsRouter);
  });

  describe("GET /groups", () => {
    it("应该返回群组列表消息", async () => {
      const response = await request(app).get("/groups").expect(200);

      expect(response.body).toEqual({
        message: "获取群组列表",
      });
    });
  });

  describe("POST /groups", () => {
    it("应该返回创建群组消息", async () => {
      const response = await request(app)
        .post("/groups")
        .send({ name: "Test Group" })
        .expect(200);

      expect(response.body).toEqual({
        message: "创建群组",
      });
    });

    it("应该处理空请求体", async () => {
      const response = await request(app).post("/groups").expect(200);

      expect(response.body).toEqual({
        message: "创建群组",
      });
    });
  });

  describe("GET /groups/:id", () => {
    it("应该返回指定群组的详情", async () => {
      const groupId = "group-123";

      const response = await request(app).get(`/groups/${groupId}`).expect(200);

      expect(response.body).toEqual({
        message: "获取群组详情",
        groupId: groupId,
      });
    });

    it("应该处理不同的群组ID", async () => {
      const groupId = "another-group-456";

      const response = await request(app).get(`/groups/${groupId}`).expect(200);

      expect(response.body).toEqual({
        message: "获取群组详情",
        groupId: groupId,
      });
    });
  });

  describe("PUT /groups/:id", () => {
    it("应该返回更新群组信息消息", async () => {
      const groupId = "group-123";
      const updateData = { name: "Updated Group Name" };

      const response = await request(app)
        .put(`/groups/${groupId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新群组信息",
        groupId: groupId,
      });
    });

    it("应该处理空请求体", async () => {
      const groupId = "group-123";

      const response = await request(app).put(`/groups/${groupId}`).expect(200);

      expect(response.body).toEqual({
        message: "更新群组信息",
        groupId: groupId,
      });
    });
  });

  describe("DELETE /groups/:id", () => {
    it("应该返回删除群组消息", async () => {
      const groupId = "group-123";

      const response = await request(app)
        .delete(`/groups/${groupId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除群组",
        groupId: groupId,
      });
    });

    it("应该处理不同的群组ID", async () => {
      const groupId = "another-group-456";

      const response = await request(app)
        .delete(`/groups/${groupId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除群组",
        groupId: groupId,
      });
    });
  });

  describe("POST /groups/:id/participants", () => {
    it("应该返回添加群组成员消息", async () => {
      const groupId = "group-123";
      const participantData = { userId: "user-456" };

      const response = await request(app)
        .post(`/groups/${groupId}/participants`)
        .send(participantData)
        .expect(200);

      expect(response.body).toEqual({
        message: "添加群组成员",
        groupId: groupId,
      });
    });

    it("应该处理空请求体", async () => {
      const groupId = "group-123";

      const response = await request(app)
        .post(`/groups/${groupId}/participants`)
        .expect(200);

      expect(response.body).toEqual({
        message: "添加群组成员",
        groupId: groupId,
      });
    });
  });

  describe("DELETE /groups/:id/participants/:userId", () => {
    it("应该返回移除群组成员消息", async () => {
      const groupId = "group-123";
      const userId = "user-456";

      const response = await request(app)
        .delete(`/groups/${groupId}/participants/${userId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "移除群组成员",
        groupId: groupId,
        userId: userId,
      });
    });

    it("应该处理不同的用户ID", async () => {
      const groupId = "group-123";
      const userId = "user-789";

      const response = await request(app)
        .delete(`/groups/${groupId}/participants/${userId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "移除群组成员",
        groupId: groupId,
        userId: userId,
      });
    });
  });

  describe("PUT /groups/:id/participants/:userId/role", () => {
    it("应该返回更改成员角色消息", async () => {
      const groupId = "group-123";
      const userId = "user-456";
      const roleData = { role: "admin" };

      const response = await request(app)
        .put(`/groups/${groupId}/participants/${userId}/role`)
        .send(roleData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更改成员角色",
        groupId: groupId,
        userId: userId,
      });
    });

    it("应该处理空请求体", async () => {
      const groupId = "group-123";
      const userId = "user-456";

      const response = await request(app)
        .put(`/groups/${groupId}/participants/${userId}/role`)
        .expect(200);

      expect(response.body).toEqual({
        message: "更改成员角色",
        groupId: groupId,
        userId: userId,
      });
    });
  });

  describe("路由参数处理", () => {
    it("应该正确处理URL参数", async () => {
      const groupId = "test-group-123";
      const userId = "test-user-456";

      const response = await request(app)
        .delete(`/groups/${groupId}/participants/${userId}`)
        .expect(200);

      expect(response.body.groupId).toBe(groupId);
      expect(response.body.userId).toBe(userId);
    });

    it("应该处理特殊字符的ID", async () => {
      const groupId = "group-with-special-chars-123";
      const userId = "user-with-special-chars-456";

      const response = await request(app)
        .delete(`/groups/${groupId}/participants/${userId}`)
        .expect(200);

      expect(response.body.groupId).toBe(groupId);
      expect(response.body.userId).toBe(userId);
    });
  });

  describe("HTTP方法支持", () => {
    it("应该支持GET方法", async () => {
      const response = await request(app).get("/groups").expect(200);

      expect(response.body.message).toBe("获取群组列表");
    });

    it("应该支持POST方法", async () => {
      const response = await request(app).post("/groups").expect(200);

      expect(response.body.message).toBe("创建群组");
    });

    it("应该支持PUT方法", async () => {
      const response = await request(app).put("/groups/test-id").expect(200);

      expect(response.body.message).toBe("更新群组信息");
    });

    it("应该支持DELETE方法", async () => {
      const response = await request(app).delete("/groups/test-id").expect(200);

      expect(response.body.message).toBe("删除群组");
    });
  });

  describe("响应格式", () => {
    it("应该返回JSON格式的响应", async () => {
      const response = await request(app).get("/groups").expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("应该包含正确的消息字段", async () => {
      const response = await request(app).get("/groups").expect(200);

      expect(response.body).toHaveProperty("message");
      expect(typeof response.body.message).toBe("string");
    });

    it("应该在需要时包含ID字段", async () => {
      const response = await request(app).get("/groups/test-id").expect(200);

      expect(response.body).toHaveProperty("groupId");
      expect(response.body.groupId).toBe("test-id");
    });
  });
});
