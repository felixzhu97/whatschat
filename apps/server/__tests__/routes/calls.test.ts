import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CallsController } from '../../src/presentation/calls/calls.controller';
import { CallsModule } from '../../src/presentation/calls/calls.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Calls Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CallsModule, DatabaseModule],
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

  describe('GET /api/v1/calls', () => {
    it('应该返回通话记录', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/calls')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/calls', () => {
    it('应该发起通话', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/calls')
        .send({ targetUserId: 'user-123', type: 'voice' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/calls/:id', () => {
    it('应该返回通话详情', async () => {
      const callId = 'call-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/calls/${callId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/v1/calls/:id/answer', () => {
    it('应该接听通话', async () => {
      const callId = 'call-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/calls/${callId}/answer`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/v1/calls/:id/reject', () => {
    it('应该拒绝通话', async () => {
      const callId = 'call-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/calls/${callId}/reject`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/v1/calls/:id/end', () => {
    it('应该结束通话', async () => {
      const callId = 'call-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/calls/${callId}/end`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
