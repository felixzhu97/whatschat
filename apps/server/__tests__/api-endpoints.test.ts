import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { RedisService } from '../../src/infrastructure/database/redis.service';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../src/infrastructure/config/config.service';
import * as bcrypt from 'bcryptjs';

describe('API端点测试 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let refreshToken: string;
  let testUserId: string;
  let testUserEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        message: {
          create: vi.fn(),
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        chat: {
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        status: {
          create: vi.fn(),
          findMany: vi.fn(),
          findUnique: vi.fn(),
          delete: vi.fn(),
        },
        call: {
          create: vi.fn(),
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        group: {
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      })
      .overrideProvider(RedisService)
      .useValue({
        getClient: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
          del: vi.fn(),
        })),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // 创建测试用户和token
    testUserId = 'test-user-id';
    testUserEmail = 'test@example.com';
    const hashedPassword = await bcrypt.hash('Test123456', 12);
    
    authToken = jwtService.sign({
      userId: testUserId,
      email: testUserEmail,
      username: 'testuser',
    });
    
    refreshToken = jwtService.sign(
      { userId: testUserId },
      { expiresIn: '30d' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('健康检查', () => {
    it('GET /api/v1/health - 应该返回健康状态', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('认证接口', () => {
    describe('POST /api/v1/auth/register - 用户注册', () => {
      it('应该成功注册新用户', async () => {
        const registerData = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Test123456',
          phone: '13800138000',
        };

        const mockUser = {
          id: 'new-user-id',
          ...registerData,
          password: await bcrypt.hash(registerData.password, 12),
          avatar: null,
          status: null,
          isOnline: false,
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.user.findUnique as any).mockResolvedValue(null);
        (prisma.user.create as any).mockResolvedValue(mockUser);

        return request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(registerData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(registerData.email);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
          });
      });

      it('应该拒绝已存在的用户', async () => {
        const existingUser = {
          id: 'existing-id',
          email: 'existing@example.com',
          username: 'existing',
        };

        (prisma.user.findUnique as any).mockResolvedValue(existingUser);

        return request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'existing',
            email: 'existing@example.com',
            password: 'Test123456',
          })
          .expect(409);
      });

      it('应该验证必填字段', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'test@example.com',
            // 缺少 username 和 password
          })
          .expect(400);
      });
    });

    describe('POST /auth/login - 用户登录', () => {
      it('应该成功登录', async () => {
        const loginData = {
          email: testUserEmail,
          password: 'Test123456',
        };

        const mockUser = {
          id: testUserId,
          email: testUserEmail,
          username: 'testuser',
          password: await bcrypt.hash('Test123456', 12),
          phone: null,
          avatar: null,
          status: null,
          isOnline: false,
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginData)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(loginData.email);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
          });
      });

      it('应该拒绝错误的密码', async () => {
        const mockUser = {
          id: testUserId,
          email: testUserEmail,
          password: await bcrypt.hash('CorrectPassword', 12),
        };

        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUserEmail,
            password: 'WrongPassword',
          })
          .expect(401);
      });

      it('应该拒绝不存在的用户', () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        return request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'Test123456',
          })
          .expect(401);
      });
    });

    describe('POST /auth/refresh-token - 刷新令牌', () => {
      it('应该成功刷新令牌', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
          });
      });

      it('应该拒绝无效的刷新令牌', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/refresh-token')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);
      });
    });

    describe('POST /auth/logout - 用户登出', () => {
      it('应该成功登出', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });

      it('应该拒绝未认证的请求', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .expect(401);
      });
    });

    describe('GET /auth/me - 获取当前用户', () => {
      it('应该返回当前用户信息', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBeDefined();
          });
      });

      it('应该拒绝未认证的请求', () => {
        return request(app.getHttpServer()).get('/auth/me').expect(401);
      });
    });

    describe('PUT /auth/profile - 更新用户资料', () => {
      it('应该返回未实现', () => {
        return request(app.getHttpServer())
          .put('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ username: 'newname' })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.code).toBe('NOT_IMPLEMENTED');
          });
      });
    });

    describe('PUT /auth/change-password - 修改密码', () => {
      it('应该返回未实现', () => {
        return request(app.getHttpServer())
          .put('/api/v1/auth/change-password')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            currentPassword: 'OldPass123',
            newPassword: 'NewPass123',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.code).toBe('NOT_IMPLEMENTED');
          });
      });
    });

    describe('POST /auth/forgot-password - 忘记密码', () => {
      it('应该返回未实现', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/forgot-password')
          .send({ email: testUserEmail })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.code).toBe('NOT_IMPLEMENTED');
          });
      });
    });

    describe('POST /auth/reset-password - 重置密码', () => {
      it('应该返回未实现', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/reset-password')
          .send({
            token: 'reset-token',
            newPassword: 'NewPass123',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.code).toBe('NOT_IMPLEMENTED');
          });
      });
    });
  });

  describe('消息接口', () => {
    describe('GET /messages/:chatId - 获取消息列表', () => {
      it('应该返回消息列表', () => {
        const chatId = 'test-chat-id';
        const mockMessages = [
          {
            id: 'msg-1',
            content: 'Hello',
            chatId,
            senderId: testUserId,
            type: 'TEXT',
            createdAt: new Date(),
          },
        ];

        (prisma.message.findMany as any).mockResolvedValue(mockMessages);

        return request(app.getHttpServer())
          .get(`/api/v1/messages/${chatId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('POST /messages - 发送消息', () => {
      it('应该成功发送消息', () => {
        const messageData = {
          chatId: 'test-chat-id',
          content: 'Test message',
          type: 'TEXT',
        };

        const mockMessage = {
          id: 'new-msg-id',
          ...messageData,
          senderId: testUserId,
          createdAt: new Date(),
        };

        (prisma.message.create as any).mockResolvedValue(mockMessage);

        return request(app.getHttpServer())
          .post('/api/v1/messages')
          .set('Authorization', `Bearer ${authToken}`)
          .send(messageData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.content).toBe(messageData.content);
          });
      });
    });

    describe('PUT /messages/:messageId - 更新消息', () => {
      it('应该成功更新消息', () => {
        const messageId = 'test-msg-id';
        const updateData = { content: 'Updated message' };

        const mockMessage = {
          id: messageId,
          content: updateData.content,
          chatId: 'test-chat-id',
          senderId: testUserId,
        };

        (prisma.message.update as any).mockResolvedValue(mockMessage);

        return request(app.getHttpServer())
          .put(`/api/v1/messages/${messageId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('DELETE /messages/:messageId - 删除消息', () => {
      it('应该成功删除消息', () => {
        const messageId = 'test-msg-id';

        (prisma.message.delete as any).mockResolvedValue({ id: messageId });

        return request(app.getHttpServer())
          .delete(`/api/v1/messages/${messageId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });

  describe('聊天接口', () => {
    describe('GET /chats - 获取聊天列表', () => {
      it('应该返回聊天列表', () => {
        const mockChats = [
          {
            id: 'chat-1',
            type: 'PRIVATE',
            createdAt: new Date(),
          },
        ];

        (prisma.chat.findMany as any).mockResolvedValue(mockChats);

        return request(app.getHttpServer())
          .get('/api/v1/chats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('POST /chats - 创建聊天', () => {
      it('应该成功创建聊天', () => {
        const chatData = {
          type: 'PRIVATE',
          participantIds: ['user-2'],
        };

        const mockChat = {
          id: 'new-chat-id',
          ...chatData,
          createdAt: new Date(),
        };

        (prisma.chat.create as any).mockResolvedValue(mockChat);

        return request(app.getHttpServer())
          .post('/api/v1/chats')
          .set('Authorization', `Bearer ${authToken}`)
          .send(chatData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('GET /chats/:id - 获取聊天详情', () => {
      it('应该返回聊天详情', () => {
        const chatId = 'test-chat-id';
        const mockChat = {
          id: chatId,
          type: 'PRIVATE',
          createdAt: new Date(),
        };

        (prisma.chat.findUnique as any).mockResolvedValue(mockChat);

        return request(app.getHttpServer())
          .get(`/api/v1/chats/${chatId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('PUT /chats/:id - 更新聊天', () => {
      it('应该成功更新聊天', () => {
        const chatId = 'test-chat-id';
        const updateData = { name: 'Updated Chat' };

        (prisma.chat.update as any).mockResolvedValue({
          id: chatId,
          ...updateData,
        });

        return request(app.getHttpServer())
          .put(`/api/v1/chats/${chatId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('DELETE /chats/:id - 删除聊天', () => {
      it('应该成功删除聊天', () => {
        const chatId = 'test-chat-id';

        (prisma.chat.delete as any).mockResolvedValue({ id: chatId });

        return request(app.getHttpServer())
          .delete(`/api/v1/chats/${chatId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });

  describe('用户接口', () => {
    describe('GET /users - 获取用户列表', () => {
      it('应该返回用户列表', () => {
        const mockUsers = [
          {
            id: 'user-1',
            email: 'user1@example.com',
            username: 'user1',
          },
        ];

        (prisma.user.findMany as any).mockResolvedValue(mockUsers);

        return request(app.getHttpServer())
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('GET /users/:id - 获取用户详情', () => {
      it('应该返回用户详情', () => {
        const userId = 'test-user-id';
        const mockUser = {
          id: userId,
          email: 'user@example.com',
          username: 'testuser',
        };

        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        return request(app.getHttpServer())
          .get(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });

  describe('群组接口', () => {
    describe('GET /groups - 获取群组列表', () => {
      it('应该返回群组列表', () => {
        const mockGroups = [
          {
            id: 'group-1',
            name: 'Test Group',
            creatorId: testUserId,
            createdAt: new Date(),
          },
        ];

        (prisma.group.findMany as any).mockResolvedValue(mockGroups);

        return request(app.getHttpServer())
          .get('/api/v1/groups')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('POST /groups - 创建群组', () => {
      it('应该成功创建群组', () => {
        const groupData = {
          name: 'New Group',
          description: 'Group description',
        };

        const mockGroup = {
          id: 'new-group-id',
          ...groupData,
          creatorId: testUserId,
          createdAt: new Date(),
        };

        (prisma.group.create as any).mockResolvedValue(mockGroup);

        return request(app.getHttpServer())
          .post('/api/v1/groups')
          .set('Authorization', `Bearer ${authToken}`)
          .send(groupData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });

  describe('通话接口', () => {
    describe('GET /calls - 获取通话记录', () => {
      it('应该返回通话记录', () => {
        return request(app.getHttpServer())
          .get('/api/v1/calls')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('POST /calls - 发起通话', () => {
      it('应该成功发起通话', () => {
        const callData = {
          type: 'AUDIO',
          chatId: 'test-chat-id',
        };

        return request(app.getHttpServer())
          .post('/api/v1/calls')
          .set('Authorization', `Bearer ${authToken}`)
          .send(callData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('GET /calls/:id - 获取通话详情', () => {
      it('应该返回通话详情', () => {
        const callId = 'test-call-id';

        return request(app.getHttpServer())
          .get(`/api/v1/calls/${callId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('PUT /calls/:id/answer - 接听通话', () => {
      it('应该成功接听通话', () => {
        const callId = 'test-call-id';

        return request(app.getHttpServer())
          .put(`/api/v1/calls/${callId}/answer`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('PUT /calls/:id/reject - 拒绝通话', () => {
      it('应该成功拒绝通话', () => {
        const callId = 'test-call-id';

        return request(app.getHttpServer())
          .put(`/api/v1/calls/${callId}/reject`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('PUT /calls/:id/end - 结束通话', () => {
      it('应该成功结束通话', () => {
        const callId = 'test-call-id';

        return request(app.getHttpServer())
          .put(`/api/v1/calls/${callId}/end`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });

  describe('状态接口', () => {
    describe('GET /status - 获取状态列表', () => {
      it('应该返回状态列表', () => {
        return request(app.getHttpServer())
          .get('/api/v1/status')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
          });
      });
    });

    describe('POST /status - 创建状态', () => {
      it('应该成功创建状态', () => {
        const statusData = {
          type: 'TEXT',
          content: 'My status',
        };

        return request(app.getHttpServer())
          .post('/api/v1/status')
          .set('Authorization', `Bearer ${authToken}`)
          .send(statusData)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('GET /status/:id - 获取状态详情', () => {
      it('应该返回状态详情', () => {
        const statusId = 'test-status-id';

        return request(app.getHttpServer())
          .get(`/api/v1/status/${statusId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });

    describe('DELETE /status/:id - 删除状态', () => {
      it('应该成功删除状态', () => {
        const statusId = 'test-status-id';

        return request(app.getHttpServer())
          .delete(`/api/v1/status/${statusId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      });
    });
  });
});

