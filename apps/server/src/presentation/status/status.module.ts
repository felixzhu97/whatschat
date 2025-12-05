import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
})
export class StatusModule {}

