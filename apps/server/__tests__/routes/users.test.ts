import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../../src/presentation/users/users.controller';
import { UsersModule } from '../../src/presentation/users/users.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Users Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, DatabaseModule],
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

  describe('GET /api/v1/users', () => {
    it('应该返回用户列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    it('应该处理分页参数', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .query({ page: '1', limit: '10' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('应该处理搜索参数', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .query({ search: 'john' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('应该返回用户详情', async () => {
      const userId = 'user-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userId', userId);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('应该更新用户信息', async () => {
      const userId = 'user-123';
      const updateData = {
        username: 'newusername',
        email: 'newemail@example.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userId', userId);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('应该删除用户', async () => {
      const userId = 'user-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/users/:id/block', () => {
    it('应该阻止用户', async () => {
      const userId = 'user-123';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${userId}/block`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/v1/users/:id/block', () => {
    it('应该取消阻止用户', async () => {
      const userId = 'user-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}/block`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
