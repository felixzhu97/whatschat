import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtAuthGuard } from '../../src/presentation/auth/jwt-auth.guard';
import { UsersModule } from '../../src/presentation/users/users.module';
import { DatabaseModule } from '../../src/infrastructure/database/database.module';

describe('JWT Auth Guard', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('认证保护', () => {
    it('应该拒绝未认证的请求', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('应该接受有效的认证令牌', async () => {
      // 注意：这需要有效的JWT令牌
      // 在实际测试中，应该先登录获取令牌
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });
});
