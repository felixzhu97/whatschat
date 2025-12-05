import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CallsController],
})
export class CallsModule {}

