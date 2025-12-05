import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { CallsService } from '../../application/services/calls.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}

