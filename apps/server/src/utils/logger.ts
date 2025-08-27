import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// 创建日志目录
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

// 定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info["timestamp"]} ${info["level"]}: ${info["message"]}`
  )
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

  // 错误日志文件
  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // 所有日志文件
  new DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
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
