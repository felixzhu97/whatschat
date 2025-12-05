import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.prisma.onModuleInit();
    await this.redis.onModuleInit();
  }

  async onModuleDestroy() {
    await this.prisma.onModuleDestroy();
    await this.redis.onModuleDestroy();
  }
}

