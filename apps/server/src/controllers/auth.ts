import { Request, Response } from 'express'
import { prisma } from '../database/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validateEmail, validatePassword } from '../utils/validation'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body

      // Validation
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确',
        })
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: '密码长度至少6位',
        })
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户已存在',
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
        },
      })

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env['JWT_SECRET']!,
        { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' }
      )

      res.status(201).json({
        success: true,
        message: '用户注册成功',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
          },
          token,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
      })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误',
        })
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误',
        })
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env['JWT_SECRET']!,
        { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' }
      )

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            status: user.status,
          },
          token,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
      })
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env['JWT_SECRET']!) as any

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token无效',
        })
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id },
        process.env['JWT_SECRET']!,
        { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' }
      )

      res.json({
        success: true,
        message: 'Token刷新成功',
        data: {
          token: newToken,
        },
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Refresh token无效',
      })
    }
  },

  async logout(req: Request, res: Response) {
    res.json({
      success: true,
      message: '退出登录成功',
    })
  },
}