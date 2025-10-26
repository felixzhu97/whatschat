# WhatsChat 开发指南

## 📋 概述

本指南为 WhatsChat 项目的开发者提供详细的开发环境设置、代码规范、调试技巧和最佳实践。

---

## 🛠️ 开发环境设置

### 系统要求

- **Node.js**: >= 18.0.0
- **PNPM**: >= 9.0.0
- **PostgreSQL**: >= 13
- **Redis**: >= 6.0
- **Git**: >= 2.30

### 1. 克隆项目

```bash
git clone https://github.com/your-username/whatschat.git
cd whatschat
```

### 2. 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装所有子项目依赖
pnpm install --recursive
```

### 3. 环境配置

#### 后端环境变量

创建 `apps/server/.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis配置
REDIS_URL="redis://localhost:6379"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# 服务器配置
PORT=3001
HOST=localhost
NODE_ENV=development

# CORS配置
CORS_ORIGIN="http://localhost:3000"

# 文件上传配置
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"

# 邮件配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# WebRTC配置
STUN_SERVER="stun:stun.l.google.com:19302"
TURN_SERVER="turn:your-turn-server.com:3478"
TURN_USERNAME="your-turn-username"
TURN_PASSWORD="your-turn-password"

# 日志配置
LOG_LEVEL="debug"
LOG_FILE="./logs/app.log"

# 监控配置
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
```

#### 前端环境变量

创建 `apps/web/.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001

# WebRTC配置
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_SERVER=turn:your-turn-server.com:3478

# 功能开关
NEXT_PUBLIC_ENABLE_CALLS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# 调试配置
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 4. 数据库设置

```bash
cd apps/server

# 生成 Prisma 客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 填充测试数据
pnpm db:seed
```

### 5. 启动开发服务器

#### 方式一：分别启动（推荐）

```bash
# 终端1：启动后端
cd apps/server
pnpm dev

# 终端2：启动前端
cd apps/web
pnpm dev

# 终端3：启动移动端（可选）
cd apps/mobile
flutter run
```

#### 方式二：同时启动所有服务

```bash
# 在项目根目录
pnpm dev
```

---

## 📁 项目结构详解

### 整体架构

```
whatschat/
├── apps/                    # 应用程序
│   ├── web/                # Next.js Web应用
│   ├── mobile/              # Flutter移动应用
│   └── server/              # Node.js服务器
├── packages/                # 共享包（未来扩展）
├── docs/                    # 文档
├── .kiro/                   # Kiro AI助手配置
├── package.json             # 根package.json
├── pnpm-workspace.yaml      # PNPM工作空间配置
├── turbo.json              # Turborepo配置
└── README.md               # 项目说明
```

### Web应用结构

```
apps/web/
├── app/                     # Next.js 13+ App Router
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── login/              # 登录页面
│   └── register/            # 注册页面
├── components/             # React组件
│   ├── ui/                 # 基础UI组件
│   ├── chat/               # 聊天相关组件
│   ├── call/               # 通话相关组件
│   └── common/              # 通用组件
├── hooks/                  # 自定义Hooks
│   ├── use-auth.ts         # 认证Hook
│   ├── use-chat.ts         # 聊天Hook
│   └── use-call.ts         # 通话Hook
├── lib/                    # 工具库
│   ├── api.ts              # API客户端
│   ├── websocket.ts        # WebSocket客户端
│   ├── webrtc.ts           # WebRTC工具
│   └── utils.ts            # 通用工具
├── stores/                 # 状态管理
│   ├── auth-store.ts       # 认证状态
│   ├── chat-store.ts       # 聊天状态
│   └── call-store.ts       # 通话状态
├── types/                  # TypeScript类型
└── data/                   # 模拟数据
```

### 服务器结构

```
apps/server/
├── src/
│   ├── app.ts              # Express应用配置
│   ├── index.ts            # 服务器入口
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── routes/             # 路由
│   ├── services/           # 业务逻辑
│   ├── database/           # 数据库相关
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型
│   └── validators/         # 数据验证
├── prisma/                 # Prisma配置
│   ├── schema.prisma       # 数据库模式
│   └── migrations/         # 数据库迁移
├── __tests__/              # 测试文件
└── logs/                   # 日志文件
```

---

## 🎨 代码规范

### TypeScript 规范

#### 1. 命名规范

```typescript
// 变量和函数：camelCase
const userName = "john";
function getUserInfo() {}

// 类：PascalCase
class UserService {}

// 接口：PascalCase，以I开头
interface IUserData {}

// 类型：PascalCase
type UserStatus = "online" | "offline";

// 常量：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// 枚举：PascalCase
enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
}
```

#### 2. 类型定义

```typescript
// 使用接口定义对象结构
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 使用类型别名定义联合类型
type MessageType = "text" | "image" | "video" | "audio" | "file";

// 使用泛型提高复用性
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 使用工具类型
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserEmail = Pick<User, "email">;
type UserWithoutId = Omit<User, "id">;
```

#### 3. 函数定义

```typescript
// 使用函数重载
function getUser(id: string): Promise<User>;
function getUser(email: string): Promise<User>;
function getUser(identifier: string): Promise<User> {
  // 实现
}

// 使用可选参数和默认值
function createUser(
  username: string,
  email: string,
  options?: {
    avatar?: string;
    status?: UserStatus;
  }
): Promise<User> {
  // 实现
}

// 使用解构参数
function updateUser(
  id: string,
  updates: Partial<Pick<User, "username" | "avatar" | "status">>
): Promise<User> {
  // 实现
}
```

### React 组件规范

#### 1. 组件定义

```typescript
// 使用函数组件
interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete
}) => {
  // 组件逻辑
  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      {/* JSX内容 */}
    </div>
  );
};

// 使用React.memo优化性能
export const ChatMessage = React.memo<ChatMessageProps>(({
  message,
  isOwn,
  onEdit,
  onDelete
}) => {
  // 组件逻辑
});
```

#### 2. Hooks使用

```typescript
// 自定义Hook
export const useChat = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, type: MessageType) => {
      try {
        setLoading(true);
        const newMessage = await messageService.sendMessage({
          chatId,
          content,
          type,
        });
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "发送失败");
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
```

#### 3. 状态管理

```typescript
// Zustand Store
interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;

  // Actions
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: {},

  setChats: (chats) => set({ chats }),

  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ) || [],
      },
    })),

  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]:
          state.messages[chatId]?.filter((msg) => msg.id !== messageId) || [],
      },
    })),
}));
```

### API 设计规范

#### 1. 路由设计

```typescript
// RESTful API设计
// GET    /api/v1/users          - 获取用户列表
// GET    /api/v1/users/:id      - 获取用户详情
// POST   /api/v1/users          - 创建用户
// PUT    /api/v1/users/:id      - 更新用户
// DELETE /api/v1/users/:id      - 删除用户

// 嵌套资源
// GET    /api/v1/chats/:id/messages     - 获取聊天消息
// POST   /api/v1/chats/:id/messages     - 发送消息
// PUT    /api/v1/chats/:id/messages/:id - 更新消息
// DELETE /api/v1/chats/:id/messages/:id - 删除消息
```

#### 2. 控制器设计

```typescript
// 控制器示例
export const userController = {
  async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 20, search } = req.query;

      const users = await userService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });

      return res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "获取用户列表失败",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "用户不存在",
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "获取用户详情失败",
      });
    }
  },
};
```

#### 3. 服务层设计

```typescript
// 服务层示例
export class UserService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  async getUsers(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    users: User[];
    pagination: PaginationInfo;
  }> {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // 并行查询数据和总数
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<User | null> {
    // 先检查缓存
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库查询
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        chats: {
          include: {
            participants: true,
          },
        },
      },
    });

    // 缓存结果
    if (user) {
      await this.redis.setex(`user:${id}`, 300, JSON.stringify(user));
    }

    return user;
  }
}
```

---

## 🧪 测试指南

### 测试策略

#### 1. 测试金字塔

```
    E2E Tests (少量)
   /                \
  /                  \
 /    Integration     \
/     Tests (适量)     \
\----------------------/
 \                    /
  \   Unit Tests     /
   \  (大量)         /
    \______________/
```

#### 2. 测试类型

- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试模块间的交互
- **端到端测试**: 测试完整的用户流程

### 前端测试

#### 1. 组件测试

```typescript
// ChatMessage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

const mockMessage = {
  id: '1',
  content: 'Hello World',
  type: 'text',
  senderId: 'user1',
  chatId: 'chat1',
  createdAt: new Date('2024-01-01T00:00:00Z')
};

describe('ChatMessage', () => {
  it('renders message content', () => {
    render(<ChatMessage message={mockMessage} isOwn={false} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows edit button for own messages', () => {
    const onEdit = jest.fn();
    render(
      <ChatMessage
        message={mockMessage}
        isOwn={true}
        onEdit={onEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

#### 2. Hook测试

```typescript
// useChat.test.ts
import { renderHook, act } from "@testing-library/react";
import { useChat } from "./useChat";

// Mock API
jest.mock("../lib/api", () => ({
  messageService: {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
  },
}));

describe("useChat", () => {
  it("sends message successfully", async () => {
    const { result } = renderHook(() => useChat("chat1"));

    await act(async () => {
      await result.current.sendMessage("Hello", "text");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Hello");
  });
});
```

### 后端测试

#### 1. 单元测试

```typescript
// userService.test.ts
import { UserService } from "../services/user";
import { PrismaClient } from "@prisma/client";

// Mock Prisma
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockPrisma, null as any);
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("returns paginated users", async () => {
      const mockUsers = [
        { id: "1", username: "user1", email: "user1@example.com" },
        { id: "2", username: "user2", email: "user2@example.com" },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(2);

      const result = await userService.getUsers({
        page: 1,
        limit: 10,
      });

      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.total).toBe(2);
    });
  });
});
```

#### 2. 集成测试

```typescript
// auth.test.ts
import request from "supertest";
import { app } from "../app";

describe("Auth API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("registers a new user", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123456",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it("rejects duplicate email", async () => {
      const userData = {
        username: "testuser",
        email: "existing@example.com",
        password: "Test123456",
      };

      await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);
    });
  });
});
```

### 测试配置

#### 1. Vitest配置

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.test.ts", "**/*.test.tsx"],
    },
  },
});
```

#### 2. 测试设置

```typescript
// vitest.setup.ts
import "@testing-library/jest-dom";

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor() {}
  close() {}
  send() {}
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;
```

---

## 🐛 调试技巧

### 前端调试

#### 1. React DevTools

```typescript
// 使用React DevTools调试组件状态
import { useState, useEffect } from 'react';

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // 在DevTools中可以看到messages状态变化
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return <div>{/* 组件内容 */}</div>;
};
```

#### 2. Redux DevTools

```typescript
// 配置Redux DevTools
import { createStore } from "redux";

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
```

#### 3. 网络调试

```typescript
// 使用浏览器Network面板调试API请求
const apiClient = {
  async request(url: string, options: RequestInit) {
    console.log("API Request:", { url, options });

    const response = await fetch(url, options);
    console.log("API Response:", response);

    return response;
  },
};
```

### 后端调试

#### 1. 日志调试

```typescript
// 使用Winston进行结构化日志
import winston from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// 在代码中使用
export const userController = {
  async getUser(req: Request, res: Response) {
    logger.debug("Getting user", { userId: req.params.id });

    try {
      const user = await userService.getUserById(req.params.id);
      logger.info("User retrieved successfully", { userId: user?.id });

      return res.json({ success: true, data: user });
    } catch (error) {
      logger.error("Failed to get user", {
        userId: req.params.id,
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};
```

#### 2. 数据库调试

```typescript
// 使用Prisma的调试功能
const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});
```

#### 3. API调试

```typescript
// 使用Postman或curl调试API
// 示例：测试用户注册API

// curl命令
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'

// 预期响应
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "username": "testuser"
    },
    "token": "jwt_token"
  }
}
```

### WebSocket调试

#### 1. 连接调试

```typescript
// 客户端WebSocket调试
const socket = io("http://localhost:3001", {
  auth: {
    token: "jwt_token",
  },
});

socket.on("connect", () => {
  console.log("WebSocket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("WebSocket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("WebSocket connection error:", error);
});
```

#### 2. 事件调试

```typescript
// 监听所有事件进行调试
const originalEmit = socket.emit;
socket.emit = function (event, ...args) {
  console.log("Emitting event:", event, args);
  return originalEmit.call(this, event, ...args);
};

const originalOn = socket.on;
socket.on = function (event, handler) {
  console.log("Listening to event:", event);
  return originalOn.call(this, event, handler);
};
```

---

## 🚀 性能优化

### 前端性能优化

#### 1. 代码分割

```typescript
// 使用动态导入进行代码分割
import { lazy, Suspense } from 'react';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const CallPage = lazy(() => import('./pages/CallPage'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/call" element={<CallPage />} />
      </Routes>
    </Suspense>
  );
};
```

#### 2. 虚拟滚动

```typescript
// 使用react-window进行虚拟滚动
import { FixedSizeList as List } from 'react-window';

const MessageList = ({ messages }: { messages: Message[] }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### 3. 图片优化

```typescript
// 使用Next.js Image组件优化图片
import Image from 'next/image';

const Avatar = ({ src, alt, size = 40 }: AvatarProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};
```

### 后端性能优化

#### 1. 数据库优化

```typescript
// 使用数据库索引
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  createdAt DateTime @default(now())

  @@index([email])
  @@index([username])
  @@index([createdAt])
}

// 使用批量操作
export class MessageService {
  async createMessages(messages: CreateMessageData[]): Promise<Message[]> {
    return await this.prisma.message.createMany({
      data: messages,
      skipDuplicates: true
    });
  }

  // 使用事务
  async transferMessages(fromChatId: string, toChatId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.message.updateMany({
        where: { chatId: fromChatId },
        data: { chatId: toChatId }
      });
    });
  }
}
```

#### 2. 缓存优化

```typescript
// 使用Redis缓存
export class UserService {
  async getUserById(id: string): Promise<User | null> {
    // 检查缓存
    const cached = await this.redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库查询
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    // 缓存结果
    if (user) {
      await this.redis.setex(`user:${id}`, 300, JSON.stringify(user));
    }

    return user;
  }

  async invalidateUserCache(id: string): Promise<void> {
    await this.redis.del(`user:${id}`);
  }
}
```

#### 3. 连接池优化

```typescript
// 配置数据库连接池
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 连接池配置
  __internal: {
    engine: {
      connectTimeout: 60000,
      queryTimeout: 30000,
      poolTimeout: 30000,
    },
  },
});

// 配置Redis连接池
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 10000,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  db: 0,
});
```

---

## 🔧 开发工具

### VS Code 配置

#### 1. 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "jebbs.plantuml",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker"
  ]
}
```

#### 2. 工作区设置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.puml": "plantuml"
  }
}
```

#### 3. 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/server/src/index.ts",
      "cwd": "${workspaceFolder}/apps/server",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "ts-node/register"],
      "sourceMaps": true,
      "restart": true,
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/server/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "cwd": "${workspaceFolder}/apps/server",
      "console": "integratedTerminal"
    }
  ]
}
```

### Git 配置

#### 1. Git Hooks

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 运行代码检查
echo "Running ESLint..."
npm run lint

# 运行类型检查
echo "Running TypeScript check..."
npm run check-types

# 运行测试
echo "Running tests..."
npm run test

echo "Pre-commit checks passed!"
```

#### 2. Git 配置

```bash
# 配置Git别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# 配置提交模板
git config --global commit.template ~/.gitmessage

# 配置推送策略
git config --global push.default simple
git config --global push.autoSetupRemote true
```

---

## 📚 最佳实践

### 1. 代码组织

- **单一职责原则**: 每个函数和类只做一件事
- **DRY原则**: 不要重复代码，提取公共逻辑
- **KISS原则**: 保持简单，避免过度设计
- **YAGNI原则**: 不要添加当前不需要的功能

### 2. 错误处理

```typescript
// 统一的错误处理
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// 错误处理中间件
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  logger.error("Unhandled error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
```

### 3. 安全实践

```typescript
// 输入验证
export const validateInput = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details,
      });
    }
    next();
  };
};

// 速率限制
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: "Too many login attempts, please try again later",
});

// 安全头
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
```

### 4. 性能监控

```typescript
// 性能监控中间件
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    // 记录慢请求
    if (duration > 1000) {
      logger.warn("Slow request detected", {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};
```

---

## 🔗 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Express.js 官方文档](https://expressjs.com/)
- [Jest 测试框架](https://jestjs.io/docs/getting-started)
- [Vitest 测试框架](https://vitest.dev/)

---
