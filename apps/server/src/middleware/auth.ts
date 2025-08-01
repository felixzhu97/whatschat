import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../database/client'

interface AuthRequest extends Request {
  user?: any
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误',
      })
    }

    const token = parts[1]

    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          status: true,
          lastSeen: true,
        },
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
        })
      }

      req.user = user
      next()
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: '认证令牌已过期',
        })
      }
      
      return res.status(401).json({
        success: false,
        message: '认证令牌无效',
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
    })
  }
}