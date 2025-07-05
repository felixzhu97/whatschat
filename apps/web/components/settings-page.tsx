"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Shield, Palette, Globe, HelpCircle, LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "../hooks/use-auth"

interface SettingsPageProps {
  onBack: () => void
  onProfileClick: () => void
}

export function SettingsPage({ onBack, onProfileClick }: SettingsPageProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeen, setLastSeen] = useState(true)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">设置</h1>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 用户信息卡片 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onProfileClick}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=64&width=64&text=我"} />
                  <AvatarFallback className="text-lg">{user?.name?.[0] || "我"}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Camera className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user?.name || "我的名字"}</h3>
                <p className="text-gray-600">{user?.about || "嗨，我正在使用 WhatsApp！"}</p>
                <p className="text-sm text-gray-500">{user?.phone || "+86 138 0013 8000"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知
            </CardTitle>
            <CardDescription>管理消息通知设置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">消息通知</p>
                <p className="text-sm text-gray-600">接收新消息通知</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">已读回执</p>
                <p className="text-sm text-gray-600">发送已读回执给联系人</p>
              </div>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">最后在线时间</p>
                <p className="text-sm text-gray-600">显示最后在线时间</p>
              </div>
              <Switch checked={lastSeen} onCheckedChange={setLastSeen} />
            </div>
          </CardContent>
        </Card>

        {/* 隐私设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              隐私
            </CardTitle>
            <CardDescription>管理隐私和安全设置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              阻止的联系人
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              两步验证
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              更改号码
            </Button>
          </CardContent>
        </Card>

        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              外观
            </CardTitle>
            <CardDescription>自定义应用外观</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              主题
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              聊天壁纸
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              字体大小
            </Button>
          </CardContent>
        </Card>

        {/* 语言设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              语言
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start">
              应用语言
            </Button>
          </CardContent>
        </Card>

        {/* 帮助 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              帮助
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              常见问题
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              联系我们
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              服务条款和隐私政策
            </Button>
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Card>
          <CardContent className="p-4">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
