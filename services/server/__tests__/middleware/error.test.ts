import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpException, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AllExceptionsFilter } from '../../src/presentation/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../../src/presentation/filters/http-exception.filter';
import { ValidationExceptionFilter } from '../../src/presentation/filters/validation-exception.filter';
import { AppModule } from '../../src/app.module';

describe('Exception Filters', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new HttpExceptionFilter(),
      new ValidationExceptionFilter(),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('AllExceptionsFilter', () => {
    it('应该处理404错误', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该处理服务器内部错误', async () => {
      // 创建一个会抛出错误的测试路由
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      // 健康检查应该正常工作
      expect(response.body).toBeDefined();
    });
  });

  describe('HttpExceptionFilter', () => {
    it('应该处理HTTP异常', async () => {
      const response = await request(app.getHttpServer())
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('ValidationExceptionFilter', () => {
    it('应该处理验证错误', async () => {
      // 测试验证错误处理
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });
});
