import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../../application/services/users.service';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

