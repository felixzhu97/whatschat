import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/database/client";
import { redisUtils } from "@/database/redis";
import config from "@/config";
import { createError, asyncHandler } from "@/middleware/error";
import { AuthTokens, JwtPayload } from "@/types";
import logger from "@/utils/logger";

// 生成JWT token
const generateTokens = (
  userId: string,
  email: string,
  username: string
): AuthTokens => {
  const accessToken = jwt.sign({ userId, email, username }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(
    { userId, email, username },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7天，以秒为单位
  };
};

// 用户注册
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, phone } = req.body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      throw createError.conflict("用户名、邮箱或手机号已存在");
    }

    // 加密密码
    const saltRounds = config.security.bcrypt.saltRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 创建默认用户设置
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    // 生成token
    const tokens = generateTokens(user.id, user.email, user.username);

    // 将refresh token存储到Redis
    await redisUtils.set(
      `refresh_token:${user.id}`,
      tokens.refreshToken,
      30 * 24 * 60 * 60
    ); // 30天

    logger.info(`新用户注册: ${user.email}`);

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        user,
        tokens,
      },
      timestamp: new Date(),
    });
  }
);

// 用户登录
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        password: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError.unauthorized("邮箱或密码错误");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError.unauthorized("邮箱或密码错误");
    }

    // 更新在线状态和最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    // 生成token
    const tokens = generateTokens(user.id, user.email, user.username);

    // 将refresh token存储到Redis
    await redisUtils.set(
      `refresh_token:${user.id}`,
      tokens.refreshToken,
      30 * 24 * 60 * 60
    );

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`用户登录: ${user.email}`);

    res.json({
      success: true,
      message: "登录成功",
      data: {
        user: userWithoutPassword,
        tokens,
      },
      timestamp: new Date(),
    });
  }
);

// 刷新token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError.badRequest("刷新令牌缺失");
    }

    try {
      // 验证refresh token
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as JwtPayload;

      // 检查Redis中是否存在该refresh token
      const storedToken = await redisUtils.get<string>(
        `refresh_token:${decoded.userId}`
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw createError.unauthorized("无效的刷新令牌");
      }

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          avatar: true,
          status: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw createError.unauthorized("用户不存在");
      }

      // 生成新的token
      const tokens = generateTokens(user.id, user.email, user.username);

      // 更新Redis中的refresh token
      await redisUtils.set(
        `refresh_token:${user.id}`,
        tokens.refreshToken,
        30 * 24 * 60 * 60
      );

      logger.info(`Token刷新: ${user.email}`);

      res.json({
        success: true,
        message: "Token刷新成功",
        data: {
          user,
          tokens,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError.unauthorized("无效的刷新令牌");
      }
      throw error;
    }
  }
);

// 用户登出
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;

    if (userId) {
      // 从Redis中删除refresh token
      await redisUtils.del(`refresh_token:${userId}`);

      // 更新用户在线状态
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      });

      logger.info(`用户登出: ${userId}`);
    }

    res.json({
      success: true,
      message: "登出成功",
      timestamp: new Date(),
    });
  }
);

// 获取当前用户信息
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (!user) {
      throw createError.unauthorized("用户未认证");
    }

    res.json({
      success: true,
      message: "获取用户信息成功",
      data: { user },
      timestamp: new Date(),
    });
  }
);

// 更新用户信息
export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    const { username, status, avatar } = req.body;

    if (!userId) {
      throw createError.unauthorized("用户未认证");
    }

    // 检查用户名是否已被其他用户使用
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw createError.conflict("用户名已存在");
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(status !== undefined && { status }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`用户信息更新: ${userId}`);

    res.json({
      success: true,
      message: "用户信息更新成功",
      data: { user: updatedUser },
      timestamp: new Date(),
    });
  }
);

// 修改密码
export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw createError.unauthorized("用户未认证");
    }

    // 获取用户当前密码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw createError.notFound("用户不存在");
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw createError.badRequest("当前密码错误");
    }

    // 加密新密码
    const saltRounds = config.security.bcrypt.saltRounds;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // 删除所有refresh token，强制重新登录
    await redisUtils.del(`refresh_token:${userId}`);

    logger.info(`密码修改: ${userId}`);

    res.json({
      success: true,
      message: "密码修改成功，请重新登录",
      timestamp: new Date(),
    });
  }
);

// 忘记密码
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      res.json({
        success: true,
        message: "如果邮箱存在，重置链接已发送",
        timestamp: new Date(),
      });
      return;
    }

    // 生成重置令牌
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1小时

    // 存储重置令牌到Redis
    await redisUtils.set(
      `reset_token:${resetToken}`,
      JSON.stringify({ userId: user.id, email: user.email }),
      60 * 60 // 1小时
    );

    // TODO: 发送重置邮件
    logger.info(`密码重置请求: ${email}, 令牌: ${resetToken}`);

    res.json({
      success: true,
      message: "重置链接已发送到邮箱",
      timestamp: new Date(),
    });
  }
);

// 重置密码
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw createError.badRequest("令牌和新密码都是必需的");
    }

    // 从Redis获取重置令牌信息
    const resetTokenData = await redisUtils.get<{
      userId: string;
      email: string;
    }>(`reset_token:${token}`);

    if (!resetTokenData) {
      throw createError.badRequest("无效或已过期的重置令牌");
    }

    // 加密新密码
    const saltRounds = config.security.bcrypt.saltRounds;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: resetTokenData.userId },
      data: { password: hashedNewPassword },
    });

    // 删除重置令牌
    await redisUtils.del(`reset_token:${token}`);

    // 删除所有refresh token，强制重新登录
    await redisUtils.del(`refresh_token:${resetTokenData.userId}`);

    logger.info(`密码重置成功: ${resetTokenData.email}`);

    res.json({
      success: true,
      message: "密码重置成功，请使用新密码登录",
      timestamp: new Date(),
    });
  }
);
