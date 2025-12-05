import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from '../../application/services/status.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}

