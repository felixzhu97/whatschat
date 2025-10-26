# WhatsChat 故障排除指南

## 📋 概述

本指南提供 WhatsChat 项目常见问题的诊断和解决方案，帮助开发者快速定位和修复问题。

---

## 🔍 诊断工具

### 健康检查

```bash
# 检查服务状态
curl http://localhost:3001/health

# 检查数据库连接
curl http://localhost:3001/api/v1/health/database

# 检查Redis连接
curl http://localhost:3001/api/v1/health/redis

# 检查WebSocket连接
curl http://localhost:3001/api/v1/health/websocket
```

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log

# 查看访问日志
tail -f logs/access.log

# 查看特定时间段的日志
grep "2024-01-01" logs/app.log
```

### 系统监控

```bash
# 检查系统资源
htop
df -h
free -h

# 检查网络连接
netstat -tulpn | grep :3001
ss -tulpn | grep :3001

# 检查进程
ps aux | grep node
```

---

## 🚨 常见问题

### 1. 数据库连接问题

#### 问题症状

- 应用启动失败
- 数据库查询超时
- 连接池耗尽

#### 诊断步骤

```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 检查数据库连接
psql -h localhost -U whatschat -d whatschat

# 检查连接数
SELECT count(*) FROM pg_stat_activity;

# 检查锁等待
SELECT * FROM pg_locks WHERE NOT granted;
```

#### 解决方案

```typescript
// 数据库连接配置优化
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "info", "warn", "error"],
  // 连接池配置
  __internal: {
    engine: {
      connectTimeout: 60000,
      queryTimeout: 30000,
      poolTimeout: 30000,
    },
  },
});

// 连接重试机制
export const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      console.log(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};
```

### 2. Redis连接问题

#### 问题症状

- 缓存失效
- 会话丢失
- 实时功能异常

#### 诊断步骤

```bash
# 检查Redis服务状态
sudo systemctl status redis

# 测试Redis连接
redis-cli ping

# 检查Redis内存使用
redis-cli info memory

# 检查Redis连接数
redis-cli info clients
```

#### 解决方案

```typescript
// Redis连接配置
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 10000,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  db: 0,
  // 连接重试
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Redis健康检查
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
};
```

### 3. WebSocket连接问题

#### 问题症状

- 实时消息不更新
- 连接频繁断开
- 通话功能异常

#### 诊断步骤

```bash
# 检查WebSocket端口
netstat -tulpn | grep :3001

# 测试WebSocket连接
wscat -c ws://localhost:3001/socket.io/

# 检查防火墙规则
sudo ufw status
```

#### 解决方案

```typescript
// WebSocket配置优化
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// 连接错误处理
io.on("connection", (socket) => {
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
});
```

### 4. 文件上传问题

#### 问题症状

- 文件上传失败
- 文件大小限制
- 文件类型不支持

#### 诊断步骤

```bash
# 检查上传目录权限
ls -la uploads/
df -h uploads/

# 检查文件类型
file uploads/test.jpg

# 检查磁盘空间
df -h
```

#### 解决方案

```typescript
// 文件上传配置
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// 文件验证中间件
export const validateFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // 检查文件大小
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ message: "File too large" });
  }

  next();
};
```

### 5. 认证问题

#### 问题症状

- 登录失败
- 令牌过期
- 权限不足

#### 诊断步骤

```bash
# 检查JWT密钥
echo $JWT_SECRET

# 测试认证API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 解决方案

```typescript
// JWT配置检查
export const validateJWTConfig = () => {
  const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
};

// 令牌验证中间件
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
```

---

## 🔧 性能问题

### 1. 响应时间慢

#### 诊断步骤

```bash
# 检查API响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/v1/health

# 检查数据库查询性能
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

# 检查慢查询日志
tail -f logs/slow-queries.log
```

#### 解决方案

```typescript
// 数据库查询优化
export const getUsersOptimized = async (options: {
  page: number;
  limit: number;
  search?: string;
}) => {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  // 使用索引优化查询
  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  // 并行查询
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

// 缓存优化
export const getCachedUser = async (userId: string) => {
  const cacheKey = `user:${userId}`;

  // 先检查缓存
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 从数据库查询
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // 缓存结果
  if (user) {
    await redis.setex(cacheKey, 300, JSON.stringify(user));
  }

  return user;
};
```

### 2. 内存泄漏

#### 诊断步骤

```bash
# 检查内存使用
ps aux | grep node
top -p $(pgrep node)

# 生成内存快照
node --inspect app.js
# 在Chrome DevTools中分析内存
```

#### 解决方案

```typescript
// 内存泄漏预防
export const cleanupResources = () => {
  // 清理定时器
  const timers = process._getActiveHandles();
  timers.forEach((timer) => {
    if (timer._handle && timer._handle.close) {
      timer._handle.close();
    }
  });

  // 清理事件监听器
  process.removeAllListeners();

  // 清理数据库连接
  prisma.$disconnect();

  // 清理Redis连接
  redis.disconnect();
};

// 优雅关闭
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  cleanupResources();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  cleanupResources();
  process.exit(0);
});
```

---

## 🌐 网络问题

### 1. CORS错误

#### 问题症状

- 跨域请求失败
- 预检请求失败
- 浏览器控制台CORS错误

#### 解决方案

```typescript
// CORS配置
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://app.whatschat.com",
      "https://admin.whatschat.com",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
};

app.use(cors(corsOptions));
```

### 2. 代理问题

#### 问题症状

- 请求被代理服务器拦截
- 负载均衡器配置错误
- CDN缓存问题

#### 解决方案

```nginx
# Nginx代理配置
upstream backend {
    server whatschat-server:3001;
}

server {
    listen 80;
    server_name api.whatschat.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 📱 移动端问题

### 1. Flutter应用问题

#### 问题症状

- 应用崩溃
- 网络请求失败
- 推送通知不工作

#### 诊断步骤

```bash
# 检查Flutter环境
flutter doctor

# 查看应用日志
flutter logs

# 检查依赖
flutter pub deps
```

#### 解决方案

```dart
// 网络请求错误处理
Future<ApiResponse> makeRequest(String url, Map<String, dynamic> data) async {
  try {
    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(data),
    );

    if (response.statusCode == 200) {
      return ApiResponse.fromJson(json.decode(response.body));
    } else {
      throw ApiException('Request failed with status: ${response.statusCode}');
    }
  } on SocketException {
    throw ApiException('No internet connection');
  } on TimeoutException {
    throw ApiException('Request timeout');
  } catch (e) {
    throw ApiException('Unexpected error: $e');
  }
}

// 推送通知配置
class NotificationService {
  static Future<void> initialize() async {
    await Firebase.initializeApp();

    FirebaseMessaging messaging = FirebaseMessaging.instance;

    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
    }
  }
}
```

---

## 🔍 调试技巧

### 1. 日志调试

```typescript
// 结构化日志
import winston from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// 使用日志
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });
  });

  next();
};
```

### 2. 性能监控

```typescript
// 性能监控中间件
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    if (duration > 1000) {
      // 超过1秒的请求
      logger.warn("Slow request detected", {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        memoryUsage: process.memoryUsage(),
      });
    }
  });

  next();
};
```

### 3. 错误追踪

```typescript
// 错误追踪中间件
export const errorTracker = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Unhandled error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // 发送到错误追踪服务
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
```

---

## 📞 获取帮助

### 1. 社区支持

- **GitHub Issues**: 报告bug和功能请求
- **Discord**: 实时技术讨论
- **Stack Overflow**: 技术问题解答

### 2. 文档资源

- **API文档**: 详细的API使用说明
- **架构文档**: 系统设计和技术选型
- **部署指南**: 生产环境部署说明

### 3. 联系方式

- **邮箱**: support@whatschat.com
- **GitHub**: https://github.com/whatschat/whatschat
- **官网**: https://whatschat.com

---

## 📚 相关资源

- [Node.js调试指南](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [PostgreSQL性能调优](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis故障排除](https://redis.io/docs/manual/troubleshooting/)
- [Flutter调试技巧](https://docs.flutter.dev/testing/debugging)

---
