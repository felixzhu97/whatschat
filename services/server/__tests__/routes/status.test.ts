import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { StatusController } from '../../src/presentation/status/status.controller';
import { StatusModule } from '../../src/presentation/status/status.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Status Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StatusModule, DatabaseModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/status', () => {
    it('应该返回状态列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/status', () => {
    it('应该发布状态', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/status')
        .send({ type: 'text', content: 'Hello World!' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/status/:id', () => {
    it('应该返回状态详情', async () => {
      const statusId = 'status-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/status/${statusId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/v1/status/:id', () => {
    it('应该删除状态', async () => {
      const statusId = 'status-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/status/${statusId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/status/:id/view', () => {
    it('应该标记状态为已查看', async () => {
      const statusId = 'status-123';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/status/${statusId}/view`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
