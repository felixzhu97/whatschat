import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {
  IAuthService,
  RegisterData,
  LoginData,
  AuthTokens,
} from "../../domain/interfaces/services/auth.service.interface";
import { IUserRepository } from "../../domain/interfaces/repositories/user.repository.interface";
import { User } from "../../domain/entities/user.entity";
import { ConfigService } from "../../infrastructure/config/config.service";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async register(
    data: RegisterData
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("用户已存在");
    }

    // 哈希密码
    const hashedPassword = await this.hashPassword(data.password);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: data.username || data.email,
        email: data.email,
        password: hashedPassword,
        ...(data.phone && { phone: data.phone }),
      },
    });

    const domainUser = User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    // 生成令牌
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username
    );

    return { user: domainUser, tokens };
  }

  async login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }> {
    // 查找用户（需要密码，所以直接使用Prisma）
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    // 验证密码
    const isPasswordValid = await this.comparePassword(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("邮箱或密码错误");
    }

    const domainUser = User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.avatar && { avatar: user.avatar }),
      ...(user.status && { status: user.status }),
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    // 生成令牌
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username
    );

    return { user: domainUser, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(refreshToken, {
        secret: config.jwt.refreshSecret,
      }) as any;

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException("Refresh token无效");
      }

      return await this.generateTokens(user.id, user.email, user.username);
    } catch (error) {
      throw new UnauthorizedException("Refresh token无效");
    }
  }

  async validateToken(
    token: string
  ): Promise<{ userId: string; email: string; username: string }> {
    try {
      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(token, {
        secret: config.jwt.secret,
      }) as any;

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException("用户不存在");
      }

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      throw new UnauthorizedException("令牌无效");
    }
  }

  async hashPassword(password: string): Promise<string> {
    const config = ConfigService.loadConfig();
    return bcrypt.hash(password, config.security.bcrypt.saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateTokens(
    userId: string,
    email: string,
    username: string
  ): Promise<AuthTokens> {
    const config = ConfigService.loadConfig();
    const payload = { userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: config.jwt.secret,
        expiresIn: config.jwt.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: config.jwt.refreshSecret,
        expiresIn: config.jwt.refreshExpiresIn,
      }),
    ]);

    // 计算过期时间（秒）
    const expiresIn = this.parseExpiresIn(config.jwt.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match || !match[1]) return 7 * 24 * 60 * 60; // 默认7天

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}
