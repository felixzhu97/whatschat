import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('状态')
@Controller('status')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatusController {
  @Get()
  @ApiOperation({ summary: '获取状态列表' })
  async getStatuses() {
    // TODO: 实现获取状态列表逻辑
    return {
      success: true,
      message: '获取状态列表',
      data: [],
    };
  }

  @Post()
  @ApiOperation({ summary: '发布状态' })
  async createStatus(@Body() _createStatusDto: any) {
    // TODO: 实现发布状态逻辑
    return {
      success: true,
      message: '发布状态',
      data: {},
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取状态详情' })
  async getStatus(@Param('id') id: string) {
    // TODO: 实现获取状态详情逻辑
    return {
      success: true,
      message: '获取状态详情',
      data: { statusId: id },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除状态' })
  async deleteStatus(@Param('id') id: string) {
    // TODO: 实现删除状态逻辑
    return {
      success: true,
      message: '删除状态',
      data: { statusId: id },
    };
  }

  @Post(':id/view')
  @ApiOperation({ summary: '标记状态为已查看' })
  async viewStatus(@Param('id') id: string) {
    // TODO: 实现标记状态为已查看逻辑
    return {
      success: true,
      message: '标记状态为已查看',
      data: { statusId: id },
    };
  }
}

