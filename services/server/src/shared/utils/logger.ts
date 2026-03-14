import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const DATA_URL_BASE64 = /(data:[^;]+;base64,)([A-Za-z0-9+/=]{50,})/g;
const BASE64_PLACEHOLDER = "[base64,";
const BASE64_SUFFIX = "chars]";

function redactBase64ForLog(msg: string): string {
  if (typeof msg !== "string") return msg;
  return msg.replace(DATA_URL_BASE64, (_, prefix, b64) => {
    const len = b64.length;
    return prefix + BASE64_PLACEHOLDER + len + BASE64_SUFFIX;
  });
}

const logDir = path.join(__dirname, "../../logs");

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env["NODE_ENV"] || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// 定义日志颜色
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const redactFormat = winston.format((info) => {
  if (typeof info.message === "string") {
    info.message = redactBase64ForLog(info.message);
  }
  return info;
});

const format = winston.format.combine(
  redactFormat(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info["timestamp"]} ${info["level"]}: ${info["message"]}`)
);

// 定义传输器
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      redactFormat(),
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  new DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      redactFormat(),
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// 创建logger实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// 开发环境下添加更多调试信息
if (process.env["NODE_ENV"] === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// 创建请求日志中间件
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.http(logMessage);
    }
  });

  next();
};

// 创建错误日志中间件
export const errorLogger = (err: any, req: any, _res: any, next: any) => {
  logger.error(
    `${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  next(err);
};

export default logger;
