import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { RedisService } from "../../infrastructure/database/redis.service";

const RECOMMENDATION_KEY_PREFIX = "recommendation:user:";

export interface SuggestedUserDto {
  id: string;
  username: string;
  avatar: string | null;
  description: string;
}

export interface FollowUserDto {
  id: string;
  username: string;
  avatar: string | null;
  isFollowing?: boolean;
}

export interface FollowListResult {
  list: FollowUserDto[];
  total: number;
  pageState?: string;
}

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException("Cannot follow self");
    await this.prisma.userFollow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });
    return { followerId, followingId, isFollowing: true };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({
      where: { followerId, followingId },
    });
    return { followerId, followingId, isFollowing: false };
  }

  async getSuggestions(currentUserId: string, limit: number = 10): Promise<SuggestedUserDto[]> {
    const cached = await this.redis.get<string[]>(`${RECOMMENDATION_KEY_PREFIX}${currentUserId}`);
    if (Array.isArray(cached) && cached.length > 0) {
      const ids = cached.slice(0, limit);
      const users = await this.prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true, avatar: true },
      });
      const orderMap = new Map(ids.map((id, i) => [id, i]));
      const sorted = users.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
      return sorted.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        description: "Suggested for you",
      }));
    }

    const FOLLOWING_CAP = 500;
    const followingIds = await this.prisma.userFollow
      .findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
        take: FOLLOWING_CAP,
      })
      .then((rows) => rows.map((r) => r.followingId));

    const alreadyFollowing = new Set(followingIds);
    alreadyFollowing.add(currentUserId);

    const friendOfFriendRaw = await this.prisma.userFollow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: { notIn: [...alreadyFollowing] },
      },
      select: { followingId: true, followerId: true },
    });

    const countByUser = new Map<string, string[]>();
    for (const row of friendOfFriendRaw) {
      if (!alreadyFollowing.has(row.followingId)) {
        const arr = countByUser.get(row.followingId) ?? [];
        arr.push(row.followerId);
        countByUser.set(row.followingId, arr);
      }
    }

    const userIdsFromFoF = Array.from(countByUser.keys());
    const fofUsers = await this.prisma.user.findMany({
      where: { id: { in: userIdsFromFoF } },
      select: { id: true, username: true, avatar: true },
    });

    const fofWithDesc: SuggestedUserDto[] = fofUsers.map((u) => {
      const followerIds = countByUser.get(u.id) ?? [];
      const desc =
        followerIds.length > 1
          ? `Followed by ${followerIds.length} people you follow`
          : "Followed by someone you follow";
      return {
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        description: desc,
      };
    });

    fofWithDesc.sort((a, b) => {
      const aCount = (countByUser.get(a.id) ?? []).length;
      const bCount = (countByUser.get(b.id) ?? []).length;
      return bCount - aCount;
    });

    const taken = new Set(fofWithDesc.map((u) => u.id));
    if (fofWithDesc.length >= limit) {
      return fofWithDesc.slice(0, limit);
    }

    const need = limit - fofWithDesc.length;
    const rest = await this.prisma.user.findMany({
      where: {
        id: { notIn: [...taken, currentUserId, ...followingIds] },
      },
      select: { id: true, username: true, avatar: true },
      take: need * 2,
      orderBy: { createdAt: "desc" },
    });

    const suggested: SuggestedUserDto[] = rest.slice(0, need).map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      description: "Suggested for you",
    }));

    return [...fofWithDesc, ...suggested].slice(0, limit);
  }

  async getFollowersCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followingId: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followerId: userId } });
  }

  async getFollowers(
    userId: string,
    limit: number = 20,
    pageState?: string,
    currentUserId?: string
  ): Promise<FollowListResult> {
    const total = await this.prisma.userFollow.count({ where: { followingId: userId } });
    const skip = pageState ? parseInt(pageState, 10) : 0;
    const rows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
      skip,
      take: limit,
      orderBy: { followerId: "asc" },
    });
    const ids = rows.map((r) => r.followerId);
    if (ids.length === 0) return { list: [], total };
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, avatar: true },
    });
    const orderMap = new Map(ids.map((id, i) => [id, i]));
    let followingByCurrent: Set<string> = new Set();
    if (currentUserId && ids.length > 0) {
      const rels = await this.prisma.userFollow.findMany({
        where: { followerId: currentUserId, followingId: { in: ids } },
        select: { followingId: true },
      });
      followingByCurrent = new Set(rels.map((r) => r.followingId));
    }
    const list = users
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        ...(currentUserId !== undefined && { isFollowing: followingByCurrent.has(u.id) }),
      }));
    const nextPageState = skip + list.length < total ? String(skip + limit) : undefined;
    return { list, total, ...(nextPageState !== undefined && { pageState: nextPageState }) };
  }

  async getFollowing(
    userId: string,
    limit: number = 20,
    pageState?: string,
    currentUserId?: string
  ): Promise<FollowListResult> {
    const total = await this.prisma.userFollow.count({ where: { followerId: userId } });
    const skip = pageState ? parseInt(pageState, 10) : 0;
    const rows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      skip,
      take: limit,
      orderBy: { followingId: "asc" },
    });
    const ids = rows.map((r) => r.followingId);
    if (ids.length === 0) return { list: [], total };
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, avatar: true },
    });
    const orderMap = new Map(ids.map((id, i) => [id, i]));
    let followingByCurrent: Set<string> = new Set();
    if (currentUserId && ids.length > 0) {
      const rels = await this.prisma.userFollow.findMany({
        where: { followerId: currentUserId, followingId: { in: ids } },
        select: { followingId: true },
      });
      followingByCurrent = new Set(rels.map((r) => r.followingId));
    }
    const list = users
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        ...(currentUserId !== undefined && { isFollowing: followingByCurrent.has(u.id) }),
      }));
    const nextPageState = skip + list.length < total ? String(skip + limit) : undefined;
    return { list, total, ...(nextPageState !== undefined && { pageState: nextPageState }) };
  }
}
