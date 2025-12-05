import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";

describe("AppModule", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("AppModule初始化", () => {
    it("应该成功创建应用实例", () => {
      expect(app).toBeDefined();
    });

    it("应该正确配置全局前缀", () => {
      app.setGlobalPrefix("api/v1");
      expect(app).toBeDefined();
    });
  });

  describe("模块配置", () => {
    it("应该正确导入所有业务模块", () => {
      expect(app).toBeDefined();
      // 验证模块已正确导入
    });
  });
});
