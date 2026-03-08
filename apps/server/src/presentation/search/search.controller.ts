import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SearchService } from "../../application/services/search.service";

@ApiTags("搜索")
@Controller("search")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "搜索用户/帖子/话题" })
  async search(
    @Query("q") q: string,
    @Query("type") type: "users" | "posts" | "hashtags" = "posts",
    @Query("limit") limit = "20",
  ) {
    const limitNum = Math.min(parseInt(String(limit), 10) || 20, 100);
    if (!q?.trim()) return { success: true, data: { hits: [] } };
    let data: { hits: unknown[] };
    if (type === "users") data = await this.searchService.searchUsers(q.trim(), limitNum);
    else if (type === "hashtags") data = await this.searchService.searchHashtags(q.trim(), limitNum);
    else data = await this.searchService.searchPosts(q.trim(), limitNum);
    return { success: true, data };
  }
}
