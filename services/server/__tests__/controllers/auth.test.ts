import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AuthController } from "../../src/presentation/auth/auth.controller";
import { AuthModule } from "../../src/presentation/auth/auth.module";

describe("Auth Controller", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /api/v1/auth/register", () => {
    it("应该注册新用户", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          username: "testuser",
          password: "password123",
          phone: "+1234567890",
        })
        .expect(201);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("应该登录用户", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    it("应该刷新令牌", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/refresh-token")
        .send({
          refreshToken: "valid-refresh-token",
        })
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
    });
  });
});
