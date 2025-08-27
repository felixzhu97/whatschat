import rateLimit from "express-rate-limit";
import config from "@/config";

// 通用速率限制
export const generalRateLimit = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    success: false,
    message: "请求过于频繁，请稍后再试",
    code: "RATE_LIMIT_EXCEEDED",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证相关的严格速率限制
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每15分钟最多5次尝试
  message: {
    success: false,
    message: "认证尝试过于频繁，请15分钟后再试",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入限制
});

// 文件上传速率限制
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 每分钟最多10次上传
  message: {
    success: false,
    message: "文件上传过于频繁，请稍后再试",
    code: "UPLOAD_RATE_LIMIT_EXCEEDED",
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
