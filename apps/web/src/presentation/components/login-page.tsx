"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, MessageCircle } from "lucide-react"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Alert, AlertDescription } from "@/src/presentation/components/ui/alert"
import { useAuth } from "../hooks/use-auth"

interface LoginPageProps {
  onSwitchToRegister: () => void
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { login, isLoading, error, clearError } = useAuth()

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!email) {
      errors.email = "请输入邮箱地址"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "请输入有效的邮箱地址"
    }

    if (!password) {
      errors.password = "请输入密码"
    } else if (password.length < 6) {
      errors.password = "密码至少需要6个字符"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) return

    console.log("尝试登录:", { email, password }) // 添加调试日志

    try {
      const result = await login(email, password)
      console.log("登录结果:", result) // 添加调试日志

      if (result.success) {
        console.log("登录成功") // 添加调试日志
      } else {
        console.log("登录失败:", result.error) // 添加调试日志
      }
    } catch (error) {
      console.error("登录过程中出错:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") setEmail(value)
    if (field === "password") setPassword(value)

    // 清除该字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // 清除全局错误
    if (error) clearError()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Web</h1>
          <p className="text-gray-600">登录您的账户以开始聊天</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 全局错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 邮箱输入 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="输入您的邮箱地址"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="输入您的密码"
                  value={password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
            </div>

            {/* 忘记密码链接 */}
            <div className="text-right">
              <Button variant="link" className="text-sm text-green-600 hover:text-green-700 p-0">
                忘记密码？
              </Button>
            </div>

            {/* 登录按钮 */}
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          {/* 分割线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>

          {/* 注册链接 */}
          <div className="text-center">
            <p className="text-gray-600">
              还没有账户？{" "}
              <Button variant="link" onClick={onSwitchToRegister} className="text-green-600 hover:text-green-700 p-0">
                立即注册
              </Button>
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>使用 WhatsApp Web 即表示您同意我们的</p>
          <div className="space-x-4 mt-1">
            <Button variant="link" className="text-gray-500 hover:text-gray-700 p-0 text-sm">
              服务条款
            </Button>
            <Button variant="link" className="text-gray-500 hover:text-gray-700 p-0 text-sm">
              隐私政策
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
