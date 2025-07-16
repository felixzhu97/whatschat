import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "@/config";
import prisma from "@/database/client";
import { JwtPayload, AuthenticatedRequest } from "@/types";
import logger from "@/utils/logger";

// 验证JWT token
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "访问令牌缺失",
        timestamp: new Date(),
      });
      return;
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // 从数据库获取用户信息
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
      res.status(401).json({
        success: false,
        message: "用户不存在",
        timestamp: new Date(),
      });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error(`认证错误: ${error}`);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "无效的访问令牌",
        timestamp: new Date(),
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "访问令牌已过期",
        timestamp: new Date(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: "认证服务错误",
        timestamp: new Date(),
      });
    }
  }
};

// 可选的认证中间件（不强制要求认证）
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

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

    if (user) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // 可选的认证失败不影响请求继续
    logger.warn(`可选认证失败: ${error}`);
    next();
  }
};

// 验证用户权限（检查用户是否为聊天参与者）
export const validateChatAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "用户未认证",
        timestamp: new Date(),
      });
      return;
    }

    // 检查用户是否为聊天参与者
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant) {
      res.status(403).json({
        success: false,
        message: "无权访问此聊天",
        timestamp: new Date(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error(`聊天访问验证错误: ${error}`);
    res.status(500).json({
      success: false,
      message: "服务器错误",
      timestamp: new Date(),
    });
  }
};

// 验证群组权限
export const validateGroupAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "用户未认证",
        timestamp: new Date(),
      });
      return;
    }

    // 检查用户是否为群组成员
    const participant = await prisma.groupParticipant.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!participant) {
      res.status(403).json({
        success: false,
        message: "无权访问此群组",
        timestamp: new Date(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error(`群组访问验证错误: ${error}`);
    res.status(500).json({
      success: false,
      message: "服务器错误",
      timestamp: new Date(),
    });
  }
};

// 验证群组管理员权限
export const validateGroupAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "用户未认证",
        timestamp: new Date(),
      });
      return;
    }

    // 检查用户是否为群组管理员
    const participant = await prisma.groupParticipant.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!participant || participant.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "需要管理员权限",
        timestamp: new Date(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error(`群组管理员验证错误: ${error}`);
    res.status(500).json({
      success: false,
      message: "服务器错误",
      timestamp: new Date(),
    });
  }
};

// 检查用户是否被阻止
export const checkBlockedUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "用户未认证",
        timestamp: new Date(),
      });
      return;
    }

    // 检查是否被阻止
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        blockedById_blockedId: {
          blockedById: userId,
          blockedId: targetUserId,
        },
      },
    });

    if (blocked) {
      res.status(403).json({
        success: false,
        message: "无法与被阻止的用户交互",
        timestamp: new Date(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error(`阻止用户检查错误: ${error}`);
    res.status(500).json({
      success: false,
      message: "服务器错误",
      timestamp: new Date(),
    });
  }
};
