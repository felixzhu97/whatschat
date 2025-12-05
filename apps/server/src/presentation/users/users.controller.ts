import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  async getUsers(
    @Query('page') _page: string = '1',
    @Query('limit') _limit: string = '20',
    @Query('search') _search?: string,
  ) {
    // TODO: 实现获取用户列表逻辑
    return {
      success: true,
      message: '获取用户列表',
      data: [],
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  async getUser(@Param('id') id: string) {
    // TODO: 实现获取用户详情逻辑
    return {
      success: true,
      message: '获取用户详情',
      data: { userId: id },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUser(
    @Param('id') id: string,
    @Body() _updateData: any,
  ) {
    // TODO: 实现更新用户信息逻辑
    return {
      success: true,
      message: '更新用户信息',
      data: { userId: id },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id') id: string) {
    // TODO: 实现删除用户逻辑
    return {
      success: true,
      message: '删除用户',
      data: { userId: id },
    };
  }

  @Post(':id/block')
  @ApiOperation({ summary: '阻止用户' })
  async blockUser(@Param('id') id: string) {
    // TODO: 实现阻止用户逻辑
    return {
      success: true,
      message: '阻止用户',
      data: { userId: id },
    };
  }

  @Delete(':id/block')
  @ApiOperation({ summary: '取消阻止用户' })
  async unblockUser(@Param('id') id: string) {
    // TODO: 实现取消阻止用户逻辑
    return {
      success: true,
      message: '取消阻止用户',
      data: { userId: id },
    };
  }
}

