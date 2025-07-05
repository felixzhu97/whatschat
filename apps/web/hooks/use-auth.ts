"use client"

import { useState, useCallback, useEffect } from "react"
import type { User, AuthState } from "../types"

const STORAGE_KEY = "whatsapp_user"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // 初始化时检查本地存储
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 简单的模拟验证 - 任何邮箱和密码都可以登录
      const user: User = {
        id: "user_" + Date.now(),
        name: email.split("@")[0] || "用户", // 使用邮箱前缀作为用户名
        email,
        phone: "+86 138 0013 8000",
        avatar: "/placeholder.svg?height=40&width=40&text=" + (email[0]?.toUpperCase() || "U"),
        about: "忙碌中",
        lastSeen: new Date(),
        isOnline: true,
      }

      // 保存到本地存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "登录失败，请检查邮箱和密码",
      }))
      return { success: false, error: "登录失败" }
    }
  }, [])

  // 注册
  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 模拟用户数据
      const user: User = {
        id: "user_" + Date.now(),
        name,
        email,
        phone,
        avatar: "/placeholder.svg?height=40&width=40&text=" + name[0],
        about: "嗨，我正在使用 WhatsApp！",
        lastSeen: new Date(),
        isOnline: true,
      }

      // 保存到本地存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "注册失败，请稍后重试",
      }))
      return { success: false, error: "注册失败" }
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }, [])

  // 更新用户信息
  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev

      const updatedUser = { ...prev.user, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))

      return {
        ...prev,
        user: updatedUser,
      }
    })
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }
}
