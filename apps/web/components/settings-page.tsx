"use client"

import { useState } from "react"
import { ArrowLeft, User, Bell, Lock, Palette, HelpCircle, Info, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface SettingsPageProps {
  onBack: () => void
  onProfileClick: () => void
}

export function SettingsPage({ onBack, onProfileClick }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeen, setLastSeen] = useState(true)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">设置</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 个人资料 */}
          <div
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={onProfileClick}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64&text=我" />
              <AvatarFallback>我</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">我的名字</h3>
              <p className="text-gray-600">这不是用户名或PIN码。此名称将对您的WhatsApp联系人可见。</p>
            </div>
            <User className="h-5 w-5 text-gray-400" />
          </div>

          <Separator />

          {/* 账户设置 */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-900">账户</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">隐私</p>
                    <p className="text-sm text-gray-600">最后在线时间、个人资料照片、关于</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">通知</p>
                    <p className="text-sm text-gray-600">消息、群组和通话提示音</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </div>

          <Separator />

          {/* 聊天设置 */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-900">聊天</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg">
                <div>
                  <p className="font-medium">已读回执</p>
                  <p className="text-sm text-gray-600">如果关闭，您将无法看到其他人的已读回执</p>
                </div>
                <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg">
                <div>
                  <p className="font-medium">最后在线时间</p>
                  <p className="text-sm text-gray-600">如果关闭，您将无法看到其他人的最后在线时间</p>
                </div>
                <Switch checked={lastSeen} onCheckedChange={setLastSeen} />
              </div>
            </div>
          </div>

          <Separator />

          {/* 外观设置 */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-900">外观</h2>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">主题</p>
                  <p className="text-sm text-gray-600">浅色</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 帮助 */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-900">帮助</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <p className="font-medium">帮助</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-600" />
                  <p className="font-medium">关于WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 退出登录 */}
          <div className="pt-4">
            <Button variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
