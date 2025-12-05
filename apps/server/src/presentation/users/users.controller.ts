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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsersService } from "../../application/services/users.service";

@ApiTags("用户")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "获取用户列表" })
  async getUsers(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("search") search?: string
  ) {
    const result = await this.usersService.getUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      ...(search && { search }),
    });

    return {
      success: true,
      message: "获取用户列表成功",
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取用户详情" })
  async getUser(@Param("id") id: string) {
    const user = await this.usersService.getUserById(id);

    return {
      success: true,
      message: "获取用户详情成功",
      data: user,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "更新用户信息" })
  async updateUser(
    @Param("id") id: string,
    @Body()
    updateData: {
      username?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      status?: string;
    }
  ) {
    const user = await this.usersService.updateUser(id, updateData);

    return {
      success: true,
      message: "更新用户信息成功",
      data: user,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);

    return {
      success: true,
      message: "用户删除成功",
    };
  }

  @Post(":id/block")
  @ApiOperation({ summary: "阻止用户" })
  async blockUser(@CurrentUser() user: any, @Param("id") blockedId: string) {
    await this.usersService.blockUser(user.id, blockedId);

    return {
      success: true,
      message: "用户已被阻止",
    };
  }

  @Delete(":id/block")
  @ApiOperation({ summary: "取消阻止用户" })
  async unblockUser(@CurrentUser() user: any, @Param("id") blockedId: string) {
    await this.usersService.unblockUser(user.id, blockedId);

    return {
      success: true,
      message: "已取消阻止用户",
    };
  }
}
