import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
})
export class GroupsModule {}

