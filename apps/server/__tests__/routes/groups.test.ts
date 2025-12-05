import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GroupsController } from '../../src/presentation/groups/groups.controller';
import { GroupsModule } from '../../src/presentation/groups/groups.module';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('Groups Controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GroupsModule, DatabaseModule],
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

  describe('GET /api/v1/groups', () => {
    it('应该返回群组列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/groups')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/groups', () => {
    it('应该创建群组', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/groups')
        .send({ name: 'Test Group' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/v1/groups/:id', () => {
    it('应该返回群组详情', async () => {
      const groupId = 'group-123';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/groups/${groupId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/v1/groups/:id', () => {
    it('应该更新群组信息', async () => {
      const groupId = 'group-123';
      const response = await request(app.getHttpServer())
        .put(`/api/v1/groups/${groupId}`)
        .send({ name: 'Updated Group' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/v1/groups/:id', () => {
    it('应该删除群组', async () => {
      const groupId = 'group-123';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/groups/${groupId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
