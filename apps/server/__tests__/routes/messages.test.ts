import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MessagesController } from '../../src/presentation/messages/messages.controller';
import { MessagesModule } from '../../src/presentation/messages/messages.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Messages Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MessagesModule, DatabaseModule],
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

  describe('GET /api/v1/messages/:chatId', () => {
    it('应该获取聊天消息', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/messages/${chatId}`)
        .query({ page: '1', limit: '20' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/messages', () => {
    it('应该发送消息', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/messages')
        .send({
          content: 'Test message',
          type: 'TEXT',
          chatId: 'chat-123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('PUT /api/v1/messages/:messageId', () => {
    it('应该更新消息', async () => {
      const messageId = 'message-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/messages/${messageId}`)
        .send({ content: 'Updated message' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/v1/messages/:messageId', () => {
    it('应该删除消息', async () => {
      const messageId = 'message-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/messages/${messageId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
