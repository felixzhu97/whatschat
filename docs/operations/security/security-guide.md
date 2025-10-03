# WhatsChat 安全指南

## 📋 概述

本指南详细介绍 WhatsChat 项目的安全最佳实践、漏洞防护、数据保护和合规要求。

---

## 🔐 认证与授权

### JWT 安全配置

```typescript
// 安全的JWT配置
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_SECRET, // 使用强密钥
    expiresIn: "15m", // 短期过期
    algorithm: "HS256",
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET, // 独立的刷新密钥
    expiresIn: "7d", // 长期过期
    algorithm: "HS256",
  },
};

// JWT中间件
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
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
```

### 密码安全

```typescript
// 密码哈希
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // 高盐值
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
export const validatePassword = (password: string): boolean => {
  // 至少8位，包含大小写字母、数字和特殊字符
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// 密码强度检查
export const checkPasswordStrength = (
  password: string
): {
  score: number;
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push("密码长度至少8位");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("需要包含小写字母");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("需要包含大写字母");

  if (/\d/.test(password)) score++;
  else feedback.push("需要包含数字");

  if (/[@$!%*?&]/.test(password)) score++;
  else feedback.push("需要包含特殊字符");

  return { score, feedback };
};
```

### 会话管理

```typescript
// 会话配置
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only
    httpOnly: true, // 防止XSS
    maxAge: 15 * 60 * 1000, // 15分钟
    sameSite: "strict", // CSRF防护
  },
};

// 会话清理
export const cleanupExpiredSessions = async () => {
  const expiredSessions = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  logger.info(`Cleaned up ${expiredSessions.count} expired sessions`);
};
```

---

## 🛡️ 输入验证与过滤

### 数据验证

```typescript
import Joi from "joi";

// 用户注册验证
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required().messages({
    "string.alphanum": "用户名只能包含字母和数字",
    "string.min": "用户名至少3个字符",
    "string.max": "用户名最多20个字符",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "请输入有效的邮箱地址",
  }),

  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base": "密码必须包含大小写字母、数字和特殊字符",
    }),
});

// 消息验证
export const messageSchema = Joi.object({
  content: Joi.string()
    .max(1000)
    .required()
    .custom((value, helpers) => {
      // 检查XSS攻击
      if (/<script|javascript:|on\w+=/i.test(value)) {
        return helpers.error("string.xss");
      }
      return value;
    })
    .messages({
      "string.max": "消息内容不能超过1000个字符",
      "string.xss": "消息内容包含不安全字符",
    }),

  type: Joi.string()
    .valid("text", "image", "video", "audio", "file")
    .required(),

  chatId: Joi.string().uuid().required(),
});
```

### SQL注入防护

```typescript
// 使用参数化查询
export const getUserById = async (id: string): Promise<User | null> => {
  // 正确的方式 - 使用Prisma的参数化查询
  return await prisma.user.findUnique({
    where: { id }, // Prisma自动处理SQL注入防护
  });
};

// 错误的方式 - 直接拼接SQL
// const query = `SELECT * FROM users WHERE id = '${id}'`; // 危险！

// 动态查询构建
export const searchUsers = async (filters: {
  username?: string;
  email?: string;
  status?: string;
}) => {
  const where: any = {};

  if (filters.username) {
    where.username = {
      contains: filters.username,
      mode: "insensitive",
    };
  }

  if (filters.email) {
    where.email = {
      contains: filters.email,
      mode: "insensitive",
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return await prisma.user.findMany({ where });
};
```

### XSS防护

```typescript
import DOMPurify from 'isomorphic-dompurify';

// 清理HTML内容
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false
  });
};

// 清理文本内容
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // 移除HTML标签
    .replace(/javascript:/gi, '') // 移除JavaScript协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim();
};

// React组件中的XSS防护
export const SafeMessage: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = useMemo(() => {
    return sanitizeText(content);
  }, [content]);

  return <div>{sanitizedContent}</div>;
};
```

---

## 🔒 数据保护

### 敏感数据加密

```typescript
import crypto from "crypto";

// 加密配置
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = "aes-256-gcm";

// 加密函数
export const encrypt = (
  text: string
): { encrypted: string; iv: string; tag: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from("whatschat", "utf8"));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
};

// 解密函数
export const decrypt = (encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): string => {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from("whatschat", "utf8"));
  decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
```

### 个人信息保护

```typescript
// 数据脱敏
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split("@");
  const maskedUsername =
    username.length > 2
      ? username[0] +
        "*".repeat(username.length - 2) +
        username[username.length - 1]
      : username;
  return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + "*".repeat(phone.length - 6) + phone.slice(-3);
};

// 数据匿名化
export const anonymizeUser = (user: User): Partial<User> => {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    status: user.status,
    // 不返回敏感信息
    // email: maskEmail(user.email),
    // phone: maskPhone(user.phone)
  };
};
```

### 数据备份与恢复

```typescript
// 数据库备份
export const backupDatabase = async (): Promise<string> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `./backups/whatschat-${timestamp}.sql`;

  const command = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;

  await execAsync(command);

  // 加密备份文件
  const encryptedBackup = encrypt(await fs.readFile(backupPath, "utf8"));
  await fs.writeFile(
    `${backupPath}.encrypted`,
    JSON.stringify(encryptedBackup)
  );

  // 删除未加密的备份
  await fs.unlink(backupPath);

  return `${backupPath}.encrypted`;
};

// 数据恢复
export const restoreDatabase = async (backupPath: string): Promise<void> => {
  const encryptedData = JSON.parse(await fs.readFile(backupPath, "utf8"));
  const decryptedData = decrypt(encryptedData);

  const tempPath = `./temp-restore-${Date.now()}.sql`;
  await fs.writeFile(tempPath, decryptedData);

  const command = `psql ${process.env.DATABASE_URL} < ${tempPath}`;
  await execAsync(command);

  await fs.unlink(tempPath);
};
```

---

## 🌐 网络安全

### HTTPS配置

```typescript
import https from "https";
import fs from "fs";

// HTTPS服务器配置
const httpsOptions = {
  key: fs.readFileSync("./ssl/private.key"),
  cert: fs.readFileSync("./ssl/certificate.crt"),
  ca: fs.readFileSync("./ssl/ca_bundle.crt"),
  secureProtocol: "TLSv1_2_method", // 使用TLS 1.2+
  ciphers: [
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES128-SHA256",
    "ECDHE-RSA-AES256-SHA384",
  ].join(":"),
  honorCipherOrder: true,
};

// 安全头配置
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

### CORS配置

```typescript
// CORS安全配置
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
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
  maxAge: 86400, // 24小时
};

app.use(cors(corsOptions));
```

### 速率限制

```typescript
import rateLimit from "express-rate-limit";

// 通用速率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证速率限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: "Too many authentication attempts",
  skipSuccessfulRequests: true,
});

// 消息发送速率限制
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30, // 最多30条消息
  message: "Too many messages sent",
});

app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/messages/", messageLimiter);
```

---

## 🔍 安全监控

### 日志记录

```typescript
import winston from "winston";

// 安全日志配置
const securityLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/security.log",
      level: "info",
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// 安全事件记录
export const logSecurityEvent = (event: {
  type: string;
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
}) => {
  securityLogger.info("Security Event", {
    timestamp: new Date().toISOString(),
    ...event,
  });
};

// 异常行为检测
export const detectAnomalousActivity = async (
  userId: string,
  activity: any
) => {
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时内
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // 检测异常模式
  const suspiciousPatterns = [
    "multiple_failed_logins",
    "unusual_location",
    "rapid_message_sending",
    "unusual_file_uploads",
  ];

  // 实现异常检测逻辑
  // ...
};
```

### 入侵检测

```typescript
// 异常IP检测
export const checkSuspiciousIP = async (ip: string): Promise<boolean> => {
  const suspiciousPatterns = [
    /^10\./, // 内网IP
    /^192\.168\./, // 内网IP
    /^127\./, // 本地IP
  ];

  // 检查IP是否在黑名单中
  const blacklisted = await prisma.blacklistedIP.findUnique({
    where: { ip },
  });

  if (blacklisted) return true;

  // 检查IP是否在短时间内有大量请求
  const recentRequests = await prisma.requestLog.count({
    where: {
      ip,
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000), // 1分钟内
      },
    },
  });

  return recentRequests > 100; // 1分钟内超过100个请求
};

// 自动封禁
export const autoBanSuspiciousIP = async (ip: string, reason: string) => {
  await prisma.blacklistedIP.create({
    data: {
      ip,
      reason,
      bannedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时
    },
  });

  logSecurityEvent({
    type: "auto_ban",
    ip,
    userAgent: "",
    details: { reason },
  });
};
```

---

## 📋 合规要求

### GDPR合规

```typescript
// 数据主体权利
export const handleDataSubjectRequest = async (request: {
  type: "access" | "rectification" | "erasure" | "portability";
  userId: string;
  email: string;
}) => {
  switch (request.type) {
    case "access":
      return await exportUserData(request.userId);

    case "rectification":
      return await updateUserData(request.userId, request.data);

    case "erasure":
      return await deleteUserData(request.userId);

    case "portability":
      return await exportUserDataInPortableFormat(request.userId);
  }
};

// 数据导出
export const exportUserData = async (userId: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      messages: true,
      chats: true,
      calls: true,
    },
  });

  return {
    personalData: {
      id: userData?.id,
      username: userData?.username,
      email: userData?.email,
      createdAt: userData?.createdAt,
    },
    messages: userData?.messages,
    chats: userData?.chats,
    calls: userData?.calls,
  };
};

// 数据删除（右被遗忘权）
export const deleteUserData = async (userId: string) => {
  await prisma.$transaction(async (tx) => {
    // 删除用户相关数据
    await tx.message.deleteMany({ where: { senderId: userId } });
    await tx.chatParticipant.deleteMany({ where: { userId } });
    await tx.callParticipant.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  logSecurityEvent({
    type: "data_deletion",
    userId,
    ip: "",
    userAgent: "",
    details: { reason: "GDPR_right_to_be_forgotten" },
  });
};
```

### 数据保留策略

```typescript
// 自动数据清理
export const cleanupExpiredData = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  // 清理30天前的临时文件
  await prisma.tempFile.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  // 清理1年前的日志
  await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: oneYearAgo,
      },
    },
  });

  // 清理过期的会话
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};
```

---

## 🚨 安全事件响应

### 事件分类

```typescript
export enum SecurityEventType {
  AUTHENTICATION_FAILURE = "authentication_failure",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_BREACH = "data_breach",
  MALICIOUS_UPLOAD = "malicious_upload",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
}

export const handleSecurityEvent = async (event: {
  type: SecurityEventType;
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ip: string;
  details: any;
}) => {
  // 记录事件
  logSecurityEvent(event);

  // 根据严重程度采取行动
  switch (event.severity) {
    case "critical":
      await handleCriticalEvent(event);
      break;
    case "high":
      await handleHighSeverityEvent(event);
      break;
    case "medium":
      await handleMediumSeverityEvent(event);
      break;
    case "low":
      await handleLowSeverityEvent(event);
      break;
  }
};
```

### 自动响应

```typescript
// 自动安全响应
export const handleCriticalEvent = async (event: any) => {
  // 立即封禁IP
  if (event.ip) {
    await autoBanSuspiciousIP(event.ip, "Critical security event");
  }

  // 暂停用户账户
  if (event.userId) {
    await prisma.user.update({
      where: { id: event.userId },
      data: { status: "suspended" },
    });
  }

  // 发送告警
  await sendSecurityAlert({
    level: "critical",
    event: event.type,
    details: event.details,
  });
};
```

---

## 📚 安全最佳实践

### 1. 代码安全

- 使用参数化查询防止SQL注入
- 验证和清理所有用户输入
- 使用HTTPS加密传输
- 实施最小权限原则
- 定期更新依赖包

### 2. 部署安全

- 使用容器安全扫描
- 配置防火墙规则
- 启用入侵检测系统
- 实施网络分段
- 定期安全审计

### 3. 运维安全

- 监控异常活动
- 实施日志分析
- 定期备份数据
- 制定应急响应计划
- 进行安全培训

---

## 🔗 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST网络安全框架](https://www.nist.gov/cyberframework)
- [GDPR合规指南](https://gdpr.eu/)
- [Node.js安全最佳实践](https://nodejs.org/en/docs/guides/security/)

---

_本文档随安全策略更新持续维护，最后更新时间：2024年1月_
