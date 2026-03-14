import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from '../../application/services/groups.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}

