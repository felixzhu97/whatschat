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

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env["NODE_ENV"] || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const logTransports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),

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

const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
      const msg = typeof info.message === "string" ? redactBase64ForLog(info.message) : info.message;
      return `${info["timestamp"]} ${info["level"]}: ${msg}`;
    })
  ),
  transports: logTransports,
});

if (process.env["NODE_ENV"] === "development") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

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

export const errorLogger = (err: any, req: any, _res: any, next: any) => {
  logger.error(
    `${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  next(err);
};

export default logger;
