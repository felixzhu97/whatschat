import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChatsController } from '../../src/presentation/chats/chats.controller';
import { ChatsModule } from '../../src/presentation/chats/chats.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Chats Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ChatsModule, DatabaseModule],
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

  describe('GET /api/v1/chats', () => {
    it('应该返回聊天列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/chats', () => {
    it('应该创建聊天', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/chats')
        .send({ name: 'Test Chat', type: 'group' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/chats/:id', () => {
    it('应该返回聊天详情', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chats/${chatId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('chatId', chatId);
    });
  });

  describe('PUT /api/v1/chats/:id', () => {
    it('应该更新聊天信息', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/chats/${chatId}`)
        .send({ name: 'Updated Chat' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/v1/chats/:id', () => {
    it('应该删除聊天', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/chats/${chatId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/chats/:id/archive', () => {
    it('应该归档聊天', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chats/${chatId}/archive`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/chats/:id/mute', () => {
    it('应该静音聊天', async () => {
      const chatId = 'chat-123';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chats/${chatId}/mute`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
