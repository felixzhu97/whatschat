# WhatsChat 测试指南

## 📋 概述

本指南详细介绍 WhatsChat 项目的测试策略、测试类型、测试工具和最佳实践。

---

## 🧪 测试策略

### 测试金字塔

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

### 测试类型

- **单元测试**: 测试单个函数、组件或类
- **集成测试**: 测试模块间的交互
- **端到端测试**: 测试完整的用户流程
- **性能测试**: 测试系统性能指标
- **安全测试**: 测试安全漏洞和防护

---

## 🔧 测试工具配置

### 前端测试工具

#### Vitest 配置

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

#### 测试设置

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

### 后端测试工具

#### Vitest 配置

```typescript
// apps/server/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

---

## 🧩 单元测试

### 前端组件测试

#### 基础组件测试

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant class', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });
});
```

#### 复杂组件测试

```typescript
// components/ChatMessage.test.tsx
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

  it('displays correct timestamp', () => {
    render(<ChatMessage message={mockMessage} isOwn={false} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });
});
```

### 自定义 Hook 测试

```typescript
// hooks/useChat.test.ts
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

  it("handles send message error", async () => {
    const { result } = renderHook(() => useChat("chat1"));

    // Mock API error
    require("../lib/api").messageService.sendMessage.mockRejectedValue(
      new Error("Network error")
    );

    await act(async () => {
      await result.current.sendMessage("Hello", "text");
    });

    expect(result.current.error).toBe("Network error");
  });
});
```

### 后端服务测试

#### 服务层测试

```typescript
// services/userService.test.ts
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

#### 工具函数测试

```typescript
// utils/validation.test.ts
import { validateEmail, validatePassword } from "./validation";

describe("validation utils", () => {
  describe("validateEmail", () => {
    it("validates correct email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(validateEmail("invalid-email")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("validates strong password", () => {
      expect(validatePassword("Test123456")).toBe(true);
    });

    it("rejects weak password", () => {
      expect(validatePassword("123")).toBe(false);
    });
  });
});
```

---

## 🔗 集成测试

### API 集成测试

```typescript
// __tests__/api/auth.test.ts
import request from "supertest";
import { app } from "../../src/app";

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

  describe("POST /api/v1/auth/login", () => {
    it("logs in with correct credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Test123456",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### 数据库集成测试

```typescript
// __tests__/database/user.test.ts
import { prisma } from "../../src/database/client";

describe("User Database", () => {
  beforeEach(async () => {
    // 清理测试数据
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates user successfully", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword",
    };

    const user = await prisma.user.create({
      data: userData,
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });

  it("finds user by email", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword",
    };

    await prisma.user.create({ data: userData });

    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe(userData.email);
  });
});
```

---

## 🎭 端到端测试

### Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
```

### E2E 测试示例

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can register and login", async ({ page }) => {
    // 访问注册页面
    await page.goto("/register");

    // 填写注册表单
    await page.fill('[data-testid="username"]', "testuser");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "Test123456");

    // 提交表单
    await page.click('[data-testid="register-button"]');

    // 验证跳转到登录页面
    await expect(page).toHaveURL("/login");

    // 登录
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "Test123456");
    await page.click('[data-testid="login-button"]');

    // 验证登录成功
    await expect(page).toHaveURL("/");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

### 聊天功能 E2E 测试

```typescript
// e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Chat Functionality", () => {
  test("user can send and receive messages", async ({ page, context }) => {
    // 创建两个浏览器上下文模拟两个用户
    const user1 = await context.newPage();
    const user2 = await context.newPage();

    // 用户1登录
    await user1.goto("/login");
    await user1.fill('[data-testid="email"]', "user1@example.com");
    await user1.fill('[data-testid="password"]', "password123");
    await user1.click('[data-testid="login-button"]');

    // 用户2登录
    await user2.goto("/login");
    await user2.fill('[data-testid="email"]', "user2@example.com");
    await user2.fill('[data-testid="password"]', "password123");
    await user2.click('[data-testid="login-button"]');

    // 用户1发送消息
    await user1.fill('[data-testid="message-input"]', "Hello from user1");
    await user1.click('[data-testid="send-button"]');

    // 验证用户2收到消息
    await expect(user2.locator('[data-testid="message-list"]')).toContainText(
      "Hello from user1"
    );
  });
});
```

---

## ⚡ 性能测试

### 负载测试

```typescript
// performance/load.test.ts
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "2m", target: 100 }, // 2分钟内达到100用户
    { duration: "5m", target: 100 }, // 保持100用户5分钟
    { duration: "2m", target: 200 }, // 2分钟内达到200用户
    { duration: "5m", target: 200 }, // 保持200用户5分钟
    { duration: "2m", target: 0 }, // 2分钟内降到0用户
  ],
};

export default function () {
  // 测试登录API
  let response = http.post("http://localhost:3001/api/v1/auth/login", {
    email: "test@example.com",
    password: "password123",
  });

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### 压力测试

```typescript
// performance/stress.test.ts
import http from "k6/http";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "1m", target: 20 },
    { duration: "1m", target: 30 },
    { duration: "1m", target: 40 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95%的请求在500ms内完成
    http_req_failed: ["rate<0.1"], // 错误率低于10%
  },
};

export default function () {
  let response = http.get("http://localhost:3001/api/v1/health");

  check(response, {
    "status is 200": (r) => r.status === 200,
  });
}
```

---

## 🔒 安全测试

### 认证测试

```typescript
// security/auth.test.ts
import request from "supertest";
import { app } from "../src/app";

describe("Security Tests", () => {
  describe("Authentication", () => {
    it("rejects requests without token", async () => {
      await request(app).get("/api/v1/auth/me").expect(401);
    });

    it("rejects invalid token", async () => {
      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("accepts valid token", async () => {
      // 先登录获取token
      const loginResponse = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      const token = loginResponse.body.data.token;

      await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });
  });

  describe("Input Validation", () => {
    it("rejects SQL injection attempts", async () => {
      const maliciousInput = "'; DROP TABLE users; --";

      await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: maliciousInput,
          email: "test@example.com",
          password: "password123",
        })
        .expect(400);
    });

    it("rejects XSS attempts", async () => {
      const xssPayload = '<script>alert("xss")</script>';

      await request(app)
        .post("/api/v1/messages")
        .set("Authorization", "Bearer valid-token")
        .send({
          content: xssPayload,
          type: "text",
          chatId: "chat1",
        })
        .expect(400);
    });
  });
});
```

---

## 📊 测试覆盖率

### 覆盖率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.config.ts",
        "**/*.d.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### 覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 查看HTML报告
open coverage/index.html
```

---

## 🚀 测试最佳实践

### 1. 测试命名

```typescript
// 好的测试命名
describe("UserService", () => {
  describe("getUserById", () => {
    it("should return user when valid id is provided", () => {
      // 测试逻辑
    });

    it("should return null when user does not exist", () => {
      // 测试逻辑
    });

    it("should throw error when invalid id is provided", () => {
      // 测试逻辑
    });
  });
});
```

### 2. 测试数据管理

```typescript
// 使用工厂函数创建测试数据
const createMockUser = (overrides = {}) => ({
  id: "1",
  username: "testuser",
  email: "test@example.com",
  password: "hashedpassword",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// 在测试中使用
const user = createMockUser({ username: "customuser" });
```

### 3. 异步测试

```typescript
// 正确处理异步测试
it("should fetch user data asynchronously", async () => {
  const userService = new UserService();

  const user = await userService.getUserById("1");

  expect(user).toBeDefined();
  expect(user.id).toBe("1");
});
```

### 4. Mock 使用

```typescript
// 合理使用Mock
jest.mock("../lib/api", () => ({
  messageService: {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
  },
}));

// 在测试中控制Mock行为
beforeEach(() => {
  require("../lib/api").messageService.sendMessage.mockResolvedValue({
    id: "1",
    content: "Test message",
  });
});
```

---

## 📝 测试脚本

### Package.json 脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "k6 run performance/load.test.ts",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

---

## 🔗 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 官方文档](https://testing-library.com/)
- [Playwright 官方文档](https://playwright.dev/)
- [Jest 官方文档](https://jestjs.io/)
- [K6 官方文档](https://k6.io/)

---
