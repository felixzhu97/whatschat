import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import logger from "@/shared/utils/logger";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "服务器内部错误";

    // 记录错误日志
    logger.error(
      `错误: ${exception instanceof Error ? exception.message : "未知错误"}`
    );
    if (exception instanceof Error) {
      logger.error(`堆栈: ${exception.stack}`);
    }
    logger.error(`请求URL: ${request.url}`);
    logger.error(`请求方法: ${request.method}`);
    logger.error(`请求IP: ${request.ip}`);

    // Prisma错误处理
    if (exception && typeof exception === "object" && "name" in exception) {
      const errorName = (exception as any).name;
      if (errorName === "PrismaClientKnownRequestError") {
        const prismaError = exception as any;
        let errorMessage = "数据库操作失败";
        let errorCode = "DATABASE_ERROR";

        switch (prismaError.code) {
          case "P2002":
            errorMessage = "数据已存在";
            errorCode = "DUPLICATE_ENTRY";
            break;
          case "P2025":
            errorMessage = "记录未找到";
            errorCode = "RECORD_NOT_FOUND";
            break;
          case "P2003":
            errorMessage = "外键约束失败";
            errorCode = "FOREIGN_KEY_CONSTRAINT";
            break;
        }

        response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // JWT错误处理
    if (exception && typeof exception === "object" && "name" in exception) {
      const errorName = (exception as any).name;
      if (errorName === "JsonWebTokenError") {
        response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: "无效的令牌",
          code: "INVALID_TOKEN",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (errorName === "TokenExpiredError") {
        response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: "令牌已过期",
          code: "TOKEN_EXPIRED",
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    const isDevelopment = process.env["NODE_ENV"] === "development";

    response.status(status).json({
      success: false,
      message:
        typeof message === "string"
          ? message
          : (message as any).message || "服务器内部错误",
      error:
        isDevelopment && exception instanceof Error
          ? exception.stack
          : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
