import { Injectable } from "@nestjs/common";

export interface AppConfig {
  server: {
    port: number;
    host: string;
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  storage: {
    aws: {
      accessKeyId?: string;
      secretAccessKey?: string;
      region: string;
      bucket: string;
      endpoint?: string;
    };
    local: {
      uploadDir: string;
      maxFileSize: number;
      allowedMimeTypes: string[];
    };
  };
  email: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    from: string;
  };
  elasticsearch: {
    node: string;
    username?: string;
    password?: string;
  };
  push: {
    fcm: {
      serverKey?: string;
    };
    apn: {
      keyId?: string;
      teamId?: string;
      bundleId: string;
    };
  };
  webrtc: {
    stunServers: string[];
    turnServers: string[];
    turnUsername?: string;
    turnCredential?: string;
  };
  logging: {
    level: string;
    filePath: string;
    maxSize: string;
    maxFiles: string;
  };
  security: {
    cors: {
      origin: string[];
      credentials: boolean;
    };
    rateLimit: {
      windowMs: number;
      max: number;
    };
    bcrypt: {
      saltRounds: number;
    };
  };
  monitoring: {
    sentry: {
      dsn?: string;
    };
    prometheus: {
      port: number;
    };
  };
  business: {
    maxGroupParticipants: number;
    maxMessageLength: number;
    maxStatusDuration: number;
    maxFileSize: number;
    messageRetentionDays: number;
    statusRetentionHours: number;
  };
}

@Injectable()
export class ConfigService {
  private static config: AppConfig;

  static loadConfig(): AppConfig {
    if (this.config) {
      return this.config;
    }

    const config: AppConfig = {
      server: {
        port: parseInt(process.env["PORT"] || "3001", 10),
        host: process.env["HOST"] || "localhost",
        nodeEnv: process.env["NODE_ENV"] || "development",
        isProduction: process.env["NODE_ENV"] === "production",
        isDevelopment: process.env["NODE_ENV"] !== "production",
      },
      database: {
        url:
          process.env["DATABASE_URL"] ||
          "postgresql://username:password@localhost:5432/whatschat?schema=public",
      },
      redis: {
        url: process.env["REDIS_URL"] || "redis://localhost:6379",
        ...(process.env["REDIS_PASSWORD"] && {
          password: process.env["REDIS_PASSWORD"],
        }),
      },
      jwt: {
        secret: process.env["JWT_SECRET"] || "your-super-secret-jwt-key-here",
        expiresIn: process.env["JWT_EXPIRES_IN"] || "7d",
        refreshSecret:
          process.env["JWT_REFRESH_SECRET"] ||
          "your-super-secret-refresh-key-here",
        refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] || "30d",
      },
      storage: {
        aws: {
          ...(process.env["AWS_ACCESS_KEY_ID"] && {
            accessKeyId: process.env["AWS_ACCESS_KEY_ID"],
          }),
          ...(process.env["AWS_SECRET_ACCESS_KEY"] && {
            secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"],
          }),
          region: process.env["AWS_REGION"] || "us-east-1",
          bucket: process.env["AWS_S3_BUCKET"] || "whatschat-files",
          ...(process.env["AWS_S3_ENDPOINT"] && {
            endpoint: process.env["AWS_S3_ENDPOINT"],
          }),
        },
        local: {
          uploadDir: process.env["UPLOAD_DIR"] || "./uploads",
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
      email: {
        host: process.env["SMTP_HOST"] || "smtp.gmail.com",
        port: parseInt(process.env["SMTP_PORT"] || "587", 10),
        ...(process.env["SMTP_USER"] && { user: process.env["SMTP_USER"] }),
        ...(process.env["SMTP_PASS"] && { pass: process.env["SMTP_PASS"] }),
        from: process.env["SMTP_FROM"] || "noreply@whatschat.com",
      },
      elasticsearch: {
        node: process.env["ELASTICSEARCH_NODE"] || "http://localhost:9200",
        ...(process.env["ELASTICSEARCH_USERNAME"] && {
          username: process.env["ELASTICSEARCH_USERNAME"],
        }),
        ...(process.env["ELASTICSEARCH_PASSWORD"] && {
          password: process.env["ELASTICSEARCH_PASSWORD"],
        }),
      },
      push: {
        fcm: {
          ...(process.env["FCM_SERVER_KEY"] && {
            serverKey: process.env["FCM_SERVER_KEY"],
          }),
        },
        apn: {
          ...(process.env["APN_KEY_ID"] && {
            keyId: process.env["APN_KEY_ID"],
          }),
          ...(process.env["APN_TEAM_ID"] && {
            teamId: process.env["APN_TEAM_ID"],
          }),
          bundleId: process.env["APN_BUNDLE_ID"] || "com.whatschat.app",
        },
      },
      webrtc: {
        stunServers: process.env["WEBRTC_STUN_SERVERS"]?.split(",") || [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
        ],
        turnServers: process.env["WEBRTC_TURN_SERVERS"]?.split(",") || [],
        ...(process.env["WEBRTC_TURN_USERNAME"] && {
          turnUsername: process.env["WEBRTC_TURN_USERNAME"],
        }),
        ...(process.env["WEBRTC_TURN_CREDENTIAL"] && {
          turnCredential: process.env["WEBRTC_TURN_CREDENTIAL"],
        }),
      },
      logging: {
        level: process.env["LOG_LEVEL"] || "info",
        filePath: process.env["LOG_FILE_PATH"] || "logs/app.log",
        maxSize: "20m",
        maxFiles: "14d",
      },
      security: {
        cors: {
          origin: process.env["CORS_ORIGIN"]?.split(",") || [
            "http://localhost:3000",
          ],
          credentials: true,
        },
        rateLimit: {
          windowMs: parseInt(
            process.env["RATE_LIMIT_WINDOW_MS"] || "900000",
            10
          ), // 15分钟
          max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
        },
        bcrypt: {
          saltRounds: 12,
        },
      },
      monitoring: {
        sentry: {
          ...(process.env["SENTRY_DSN"] && { dsn: process.env["SENTRY_DSN"] }),
        },
        prometheus: {
          port: parseInt(process.env["PROMETHEUS_PORT"] || "9090", 10),
        },
      },
      business: {
        maxGroupParticipants: 256,
        maxMessageLength: 4096,
        maxStatusDuration: 24 * 60 * 60 * 1000, // 24小时
        maxFileSize: 50 * 1024 * 1024, // 50MB
        messageRetentionDays: 365,
        statusRetentionHours: 24,
      },
    };

    this.config = config;
    return config;
  }

  static validateConfig(config: any): AppConfig {
    const nodeEnv = process.env["NODE_ENV"] || "development";
    const isProduction = nodeEnv === "production";

    // 在生产环境中进行严格验证
    if (isProduction) {
      const requiredConfigs = [
        {
          key: "JWT_SECRET",
          value: config.jwt?.secret,
          validator: (val: string) => val && val.length >= 32,
          message: "JWT_SECRET must be at least 32 characters long",
        },
        {
          key: "DATABASE_URL",
          value: config.database?.url,
          validator: (val: string) => val && val.startsWith("postgresql://"),
          message: "DATABASE_URL must be a valid PostgreSQL connection string",
        },
        {
          key: "REDIS_URL",
          value: config.redis?.url,
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
      // 开发环境：只检查是否设置了环境变量，不验证格式
      const warnings: string[] = [];

      if (
        !process.env["JWT_SECRET"] ||
        config.jwt?.secret === "your-super-secret-jwt-key-here"
      ) {
        warnings.push("警告: 使用默认JWT_SECRET，生产环境请设置强密钥");
      }

      if (
        !process.env["DATABASE_URL"] ||
        config.database?.url?.includes("username:password")
      ) {
        warnings.push("警告: 使用默认DATABASE_URL，请设置正确的数据库连接");
      }

      if (
        !process.env["REDIS_URL"] ||
        config.redis?.url === "redis://localhost:6379"
      ) {
        warnings.push("警告: 使用默认REDIS_URL，请设置正确的Redis连接");
      }

      if (warnings.length > 0) {
        console.warn("配置警告:\n" + warnings.join("\n"));
      }
    }

    return config as AppConfig;
  }

  getConfig(): AppConfig {
    return ConfigService.loadConfig();
  }
}
