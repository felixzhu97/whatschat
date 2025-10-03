import { Request, Response } from "express";
import { prisma } from "../database/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateEmail, validatePassword } from "../utils/validation";

export const authController = {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, username, phone } = req.body;

      // Validation
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "邮箱格式不正确",
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: "密码长度至少6位",
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "用户已存在",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: username || email,
          email,
          password: hashedPassword,
          phone,
        },
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env["JWT_SECRET"] as jwt.Secret,
        {
          expiresIn: (process.env["JWT_EXPIRES_IN"] as any) || "7d",
        } as jwt.SignOptions
      );

      return res.status(201).json({
        success: true,
        message: "用户注册成功",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
          },
          token,
        },
      });
    } catch (error) {
      console.error("注册错误:", error);
      return res.status(500).json({
        success: false,
        message: "服务器内部错误",
        error:
          process.env["NODE_ENV"] === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  },

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "邮箱或密码错误",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "邮箱或密码错误",
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env["JWT_SECRET"] as jwt.Secret,
        {
          expiresIn: (process.env["JWT_EXPIRES_IN"] as any) || "7d",
        } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
          },
          token,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "服务器内部错误",
      });
    }
  },

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env["JWT_SECRET"] as jwt.Secret
      ) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Refresh token无效",
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id },
        process.env["JWT_SECRET"] as jwt.Secret,
        {
          expiresIn: (process.env["JWT_EXPIRES_IN"] as any) || "7d",
        } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: "Token刷新成功",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Refresh token无效",
      });
    }
  },

  async logout(_req: Request, res: Response): Promise<Response> {
    return res.json({
      success: true,
      message: "退出登录成功",
    });
  },
};

// 为路由提供命名导出，指向已实现的方法
export const register = authController.register;
export const login = authController.login;
export const refreshToken = authController.refreshToken;
export const logout = authController.logout;

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 从中间件验证后的req.user获取用户信息
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户信息不存在",
      });
    }

    return res.json({
      success: true,
      message: "获取用户信息成功",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
};

export const updateProfile = async (_req: Request, res: Response) => {
  return res
    .status(501)
    .json({ success: false, message: "未实现", code: "NOT_IMPLEMENTED" });
};

export const changePassword = async (_req: Request, res: Response) => {
  return res
    .status(501)
    .json({ success: false, message: "未实现", code: "NOT_IMPLEMENTED" });
};

export const forgotPassword = async (_req: Request, res: Response) => {
  return res
    .status(501)
    .json({ success: false, message: "未实现", code: "NOT_IMPLEMENTED" });
};

export const resetPassword = async (_req: Request, res: Response) => {
  return res
    .status(501)
    .json({ success: false, message: "未实现", code: "NOT_IMPLEMENTED" });
};
