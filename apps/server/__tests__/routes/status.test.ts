import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import statusRouter from "../../src/routes/status";

describe("Status Router", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/status", statusRouter);
  });

  describe("GET /status", () => {
    it("应该返回状态列表消息", async () => {
      const response = await request(app).get("/status").expect(200);

      expect(response.body).toEqual({
        message: "获取状态列表",
      });
    });
  });

  describe("POST /status", () => {
    it("应该返回发布状态消息", async () => {
      const statusData = {
        type: "text",
        content: "Hello World!",
      };

      const response = await request(app)
        .post("/status")
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        message: "发布状态",
      });
    });

    it("应该处理空请求体", async () => {
      const response = await request(app).post("/status").expect(200);

      expect(response.body).toEqual({
        message: "发布状态",
      });
    });

    it("应该处理不同类型的状态", async () => {
      const imageStatus = {
        type: "image",
        content: "Check out this image!",
        mediaUrl: "https://example.com/image.jpg",
      };

      const response = await request(app)
        .post("/status")
        .send(imageStatus)
        .expect(200);

      expect(response.body).toEqual({
        message: "发布状态",
      });
    });

    it("应该处理视频状态", async () => {
      const videoStatus = {
        type: "video",
        content: "Amazing video!",
        mediaUrl: "https://example.com/video.mp4",
        duration: 30,
      };

      const response = await request(app)
        .post("/status")
        .send(videoStatus)
        .expect(200);

      expect(response.body).toEqual({
        message: "发布状态",
      });
    });
  });

  describe("GET /status/:id", () => {
    it("应该返回指定状态的详情", async () => {
      const statusId = "status-123";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取状态详情",
        statusId: statusId,
      });
    });

    it("应该处理不同的状态ID", async () => {
      const statusId = "another-status-456";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取状态详情",
        statusId: statusId,
      });
    });

    it("应该处理特殊字符的状态ID", async () => {
      const statusId = "status-with-special-chars-123";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取状态详情",
        statusId: statusId,
      });
    });
  });

  describe("DELETE /status/:id", () => {
    it("应该返回删除状态消息", async () => {
      const statusId = "status-123";

      const response = await request(app)
        .delete(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除状态",
        statusId: statusId,
      });
    });

    it("应该处理不同的状态ID", async () => {
      const statusId = "another-status-456";

      const response = await request(app)
        .delete(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除状态",
        statusId: statusId,
      });
    });

    it("应该处理UUID格式的状态ID", async () => {
      const statusId = "550e8400-e29b-41d4-a716-446655440000";

      const response = await request(app)
        .delete(`/status/${statusId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除状态",
        statusId: statusId,
      });
    });
  });

  describe("POST /status/:id/view", () => {
    it("应该返回标记状态为已查看消息", async () => {
      const statusId = "status-123";

      const response = await request(app)
        .post(`/status/${statusId}/view`)
        .expect(200);

      expect(response.body).toEqual({
        message: "标记状态为已查看",
        statusId: statusId,
      });
    });

    it("应该处理不同的状态ID", async () => {
      const statusId = "another-status-456";

      const response = await request(app)
        .post(`/status/${statusId}/view`)
        .expect(200);

      expect(response.body).toEqual({
        message: "标记状态为已查看",
        statusId: statusId,
      });
    });

    it("应该处理带查询参数的状态ID", async () => {
      const statusId = "status-123";

      const response = await request(app)
        .post(`/status/${statusId}/view`)
        .query({ userId: "user-456" })
        .expect(200);

      expect(response.body).toEqual({
        message: "标记状态为已查看",
        statusId: statusId,
      });
    });
  });

  describe("路由参数处理", () => {
    it("应该正确处理URL参数", async () => {
      const statusId = "test-status-123";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body.statusId).toBe(statusId);
    });

    it("应该处理包含数字的ID", async () => {
      const statusId = "status123";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body.statusId).toBe(statusId);
    });

    it("应该处理包含连字符的ID", async () => {
      const statusId = "status-with-hyphens-123";

      const response = await request(app)
        .get(`/status/${statusId}`)
        .expect(200);

      expect(response.body.statusId).toBe(statusId);
    });
  });

  describe("HTTP方法支持", () => {
    it("应该支持GET方法", async () => {
      const response = await request(app).get("/status").expect(200);

      expect(response.body.message).toBe("获取状态列表");
    });

    it("应该支持POST方法", async () => {
      const response = await request(app).post("/status").expect(200);

      expect(response.body.message).toBe("发布状态");
    });

    it("应该支持DELETE方法", async () => {
      const response = await request(app).delete("/status/test-id").expect(200);

      expect(response.body.message).toBe("删除状态");
    });
  });

  describe("响应格式", () => {
    it("应该返回JSON格式的响应", async () => {
      const response = await request(app).get("/status").expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("应该包含正确的消息字段", async () => {
      const response = await request(app).get("/status").expect(200);

      expect(response.body).toHaveProperty("message");
      expect(typeof response.body.message).toBe("string");
    });

    it("应该在需要时包含statusId字段", async () => {
      const response = await request(app).get("/status/test-id").expect(200);

      expect(response.body).toHaveProperty("statusId");
      expect(response.body.statusId).toBe("test-id");
    });
  });

  describe("状态类型处理", () => {
    it("应该处理文本状态", async () => {
      const textStatus = {
        type: "text",
        content: "This is a text status",
      };

      const response = await request(app)
        .post("/status")
        .send(textStatus)
        .expect(200);

      expect(response.body.message).toBe("发布状态");
    });

    it("应该处理图片状态", async () => {
      const imageStatus = {
        type: "image",
        content: "Check out this image!",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
      };

      const response = await request(app)
        .post("/status")
        .send(imageStatus)
        .expect(200);

      expect(response.body.message).toBe("发布状态");
    });

    it("应该处理视频状态", async () => {
      const videoStatus = {
        type: "video",
        content: "Amazing video!",
        mediaUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/video-thumb.jpg",
        duration: 60,
      };

      const response = await request(app)
        .post("/status")
        .send(videoStatus)
        .expect(200);

      expect(response.body.message).toBe("发布状态");
    });
  });

  describe("错误处理", () => {
    it("应该处理无效的路由", async () => {
      const response = await request(app)
        .get("/status/invalid/route")
        .expect(404);

      // 由于没有匹配的路由，应该返回404
    });

    it("应该处理不支持的HTTP方法", async () => {
      const response = await request(app).patch("/status").expect(404);

      // PATCH方法不被支持，应该返回404
    });
  });
});
