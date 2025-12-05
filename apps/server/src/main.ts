import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./presentation/filters/all-exceptions.filter";
import { HttpExceptionFilter } from "./presentation/filters/http-exception.filter";
import { ValidationExceptionFilter } from "./presentation/filters/validation-exception.filter";
import { LoggingInterceptor } from "./presentation/interceptors/logging.interceptor";
import { TransformInterceptor } from "./presentation/interceptors/transform.interceptor";
import logger from "@/shared/utils/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix("api/v1");

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS配置
  const corsOptions = {
    origin: process.env["CORS_ORIGIN"]?.split(",") || ["http://localhost:3000"],
    credentials: true,
  };
  app.enableCors(corsOptions);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor()
  );

  // 全局异常过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new ValidationExceptionFilter()
  );

  // Swagger文档配置
  if (process.env["NODE_ENV"] !== "production") {
    const config = new DocumentBuilder()
      .setTitle("WhatsChat API")
      .setDescription("WhatsChat即时通讯应用API文档")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = parseInt(process.env["PORT"] || "3001", 10);
  const host = process.env["HOST"] || "localhost";

  await app.listen(port, host);

  logger.info(`🚀 WhatsChat服务器启动成功`);
  logger.info(`📍 地址: http://${host}:${port}`);
  logger.info(`🌍 环境: ${process.env["NODE_ENV"] || "development"}`);
  if (process.env["NODE_ENV"] !== "production") {
    logger.info(`📚 API文档: http://${host}:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  logger.error("应用启动失败:", error);
  process.exit(1);
});
