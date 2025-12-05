import dotenv from "dotenv";
import path from "path";

// 加载环境变量
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env["PORT"] || "3001", 10),
    host: process.env["HOST"] || "localhost",
    nodeEnv: process.env["NODE_ENV"] || "development",
    isProduction: process.env["NODE_ENV"] === "production",
    isDevelopment: process.env["NODE_ENV"] === "development",
  },

  // 数据库配置
  database: {
    url:
      process.env["DATABASE_URL"] ||
      "postgresql://username:password@localhost:5432/whatschat?schema=public",
  },

  // Redis配置
  redis: {
    url: process.env["REDIS_URL"] || "redis://localhost:6379",
    password: process.env["REDIS_PASSWORD"],
  },

  // JWT配置
  jwt: {
    secret: process.env["JWT_SECRET"] || "your-super-secret-jwt-key-here",
    expiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
    refreshSecret:
      process.env["JWT_REFRESH_SECRET"] || "your-super-secret-refresh-key-here",
    refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
  },

  // 文件存储配置
  storage: {
    aws: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
      region: process.env["AWS_REGION"] || "us-east-1",
      bucket: process.env["AWS_S3_BUCKET"] || "whatschat-files",
      endpoint: process.env["AWS_S3_ENDPOINT"],
    },
    local: {
      uploadDir: path.join(__dirname, "../../uploads"),
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "application/pdf",
        "text/plain",
      ],
    },
  },

  // 邮件服务配置
  email: {
    host: process.env["SMTP_HOST"] || "smtp.gmail.com",
    port: parseInt(process.env["SMTP_PORT"] || "587", 10),
    user: process.env["SMTP_USER"],
    pass: process.env["SMTP_PASS"],
    from: process.env["SMTP_FROM"] || "noreply@whatschat.com",
  },

  // 搜索引擎配置
  elasticsearch: {
    node: process.env["ELASTICSEARCH_NODE"] || "http://localhost:9200",
    username: process.env["ELASTICSEARCH_USERNAME"],
    password: process.env["ELASTICSEARCH_PASSWORD"],
  },

  // 推送服务配置
  push: {
    fcm: {
      serverKey: process.env["FCM_SERVER_KEY"],
    },
    apn: {
      keyId: process.env["APN_KEY_ID"],
      teamId: process.env["APN_TEAM_ID"],
      bundleId: process.env["APN_BUNDLE_ID"] || "com.whatschat.app",
    },
  },

  // WebRTC配置
  webrtc: {
    stunServers: process.env["WEBRTC_STUN_SERVERS"]?.split(",") || [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
    ],
    turnServers: process.env["WEBRTC_TURN_SERVERS"]?.split(",") || [],
    turnUsername: process.env["WEBRTC_TURN_USERNAME"],
    turnCredential: process.env["WEBRTC_TURN_CREDENTIAL"],
  },

  // 日志配置
  logging: {
    level: process.env["LOG_LEVEL"] || "info",
    filePath: process.env["LOG_FILE_PATH"] || "logs/app.log",
    maxSize: "20m",
    maxFiles: "14d",
  },

  // 安全配置
  security: {
    cors: {
      origin: process.env["CORS_ORIGIN"]?.split(",") || [
        "http://localhost:3000",
      ],
      credentials: true,
    },
    rateLimit: {
      windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000", 10), // 15分钟
      max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
    },
    bcrypt: {
      saltRounds: 12,
    },
  },

  // 监控配置
  monitoring: {
    sentry: {
      dsn: process.env["SENTRY_DSN"],
    },
    prometheus: {
      port: parseInt(process.env["PROMETHEUS_PORT"] || "9090", 10),
    },
  },

  // 业务配置
  business: {
    maxGroupParticipants: 256,
    maxMessageLength: 4096,
    maxStatusDuration: 24 * 60 * 60 * 1000, // 24小时
    maxFileSize: 50 * 1024 * 1024, // 50MB
    messageRetentionDays: 365,
    statusRetentionHours: 24,
  },
};

// 验证必需的配置
export const validateConfig = (): void => {
  const nodeEnv = config.server.nodeEnv;
  const isProduction = nodeEnv === "production";

  // 在生产环境中进行严格验证
  if (isProduction) {
    const requiredConfigs = [
      {
        key: "JWT_SECRET",
        value: config.jwt.secret,
        validator: (val: string) => val && val.length >= 32,
        message: "JWT_SECRET must be at least 32 characters long",
      },
      {
        key: "DATABASE_URL",
        value: config.database.url,
        validator: (val: string) => val && val.startsWith("postgresql://"),
        message: "DATABASE_URL must be a valid PostgreSQL connection string",
      },
      {
        key: "REDIS_URL",
        value: config.redis.url,
        validator: (val: string) =>
          val && (val.startsWith("redis://") || val.startsWith("rediss://")),
        message: "REDIS_URL must be a valid Redis connection string",
      },
    ];

    const invalidConfigs = requiredConfigs.filter(
      ({ value, validator }) => !value || !validator(value)
    );

    if (invalidConfigs.length > 0) {
      const errorMessages = invalidConfigs.map(
        ({ key, message }) => `${key}: ${message}`
      );
      throw new Error(`配置验证失败:\n${errorMessages.join("\n")}`);
    }
  } else {
    // 开发环境：只显示警告，不抛出错误
    const warnings: string[] = [];

    if (
      !process.env["JWT_SECRET"] ||
      config.jwt.secret === "your-super-secret-jwt-key-here" ||
      config.jwt.secret.length < 32
    ) {
      warnings.push(
        "警告: JWT_SECRET 长度不足32个字符，生产环境请设置至少32个字符的强密钥"
      );
    }

    if (
      !process.env["DATABASE_URL"] ||
      config.database.url.includes("username:password")
    ) {
      warnings.push("警告: 使用默认DATABASE_URL，请设置正确的数据库连接");
    }

    if (
      !process.env["REDIS_URL"] ||
      config.redis.url === "redis://localhost:6379"
    ) {
      warnings.push("警告: 使用默认REDIS_URL，请设置正确的Redis连接");
    }

    if (warnings.length > 0) {
      console.warn("配置警告:\n" + warnings.join("\n"));
    }
  }
};

export default config;
