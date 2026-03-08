import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { PostService } from "../../application/services/post.service";
import { FeedService } from "../../application/services/feed.service";

@ApiTags("帖子")
@Controller("posts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly feedService: FeedService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "发帖" })
  async createPost(
    @CurrentUser() user: { id: string },
    @Body() body: { caption: string; type: string; mediaUrls?: string[]; location?: string }
  ) {
    const data = await this.postService.createPost(user.id, {
      caption: body.caption,
      type: body.type,
      ...(body.mediaUrls != null && { mediaUrls: body.mediaUrls }),
      ...(body.location != null && { location: body.location }),
    });
    return { success: true, data };
  }

  @Get("feed")
  @ApiOperation({ summary: "获取当前用户 Feed" })
  async getFeed(
    @CurrentUser() user: { id: string },
    @Query("limit") limit = "20",
    @Query("pageState") pageState?: string,
  ) {
    const data = await this.feedService.getFeed(user.id, parseInt(limit, 10), pageState);
    return { success: true, ...data };
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "获取用户帖子列表" })
  async getPostsByUser(
    @Param("userId") userId: string,
    @Query("limit") limit = "20",
    @Query("pageState") pageState?: string
  ) {
    const data = await this.postService.getPostsByUser(userId, parseInt(limit, 10), pageState);
    return { success: true, ...data };
  }

  @Get(":postId")
  @ApiOperation({ summary: "获取帖子详情" })
  async getPost(@Param("postId") postId: string) {
    const data = await this.postService.getPost(postId);
    return { success: true, data };
  }

  @Delete(":postId")
  @ApiOperation({ summary: "删除帖子" })
  async deletePost(@CurrentUser() user: { id: string }, @Param("postId") postId: string) {
    await this.postService.deletePost(postId, user.id);
    return { success: true, message: "已删除" };
  }
}
