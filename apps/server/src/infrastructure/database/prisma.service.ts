import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log:
        process.env['NODE_ENV'] === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      const nodeEnv = process.env['NODE_ENV'] || 'development';
      const isProduction = nodeEnv === 'production';
      
      if (isProduction) {
        logger.error('❌ Database connection failed:', error);
        throw error;
      } else {
        logger.warn('⚠️  Database connection failed (开发模式，应用将继续启动):');
        logger.warn(`   请确保PostgreSQL服务正在运行`);
        logger.warn(`   连接字符串: ${process.env['DATABASE_URL'] || '未设置'}`);
        // 在开发环境中不抛出错误，允许应用启动
        // 但会在实际使用数据库时失败
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      logger.info('✅ Database disconnected successfully');
    } catch (error) {
      logger.error('❌ Database disconnection failed:', error);
    }
  }
}

