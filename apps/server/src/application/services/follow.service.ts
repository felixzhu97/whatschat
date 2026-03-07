import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException("Cannot follow self");
    await this.prisma.userFollow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });
    return { followerId, followingId };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({
      where: { followerId, followingId },
    });
    return { unfollowed: true };
  }
}
