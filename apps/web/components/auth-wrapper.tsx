"use client"

import type React from "react"

import { useState } from "react"
import { LoginPage } from "./login-page"
import { RegisterPage } from "./register-page"
import { useAuth } from "../hooks/use-auth"
import { Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { isAuthenticated, isLoading, user } = useAuth()

  // 添加调试日志
  console.log("AuthWrapper 状态:", { isAuthenticated, isLoading, user })

  // 显示加载状态
  if (isLoading) {
    console.log("显示加载状态")
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，显示登录/注册页面
  if (!isAuthenticated) {
    console.log("显示登录页面")
    return (
      <>
        {authMode === "login" ? (
          <LoginPage onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </>
    )
  }

  // 如果已认证，显示主应用
  console.log("显示主应用")
  return <>{children}</>
}
