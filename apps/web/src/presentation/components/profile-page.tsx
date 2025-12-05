"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Edit2, Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { ScrollArea } from "@/src/presentation/components/ui/scroll-area"
import { Separator } from "@/src/presentation/components/ui/separator"
import { useAuth } from "../hooks/use-auth"

interface ProfilePageProps {
  onBack: () => void
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, updateUser } = useAuth()
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [tempName, setTempName] = useState(user?.name || "")
  const [tempAbout, setTempAbout] = useState(user?.about || "")

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUser({ name: tempName.trim() })
      setIsEditingName(false)
    }
  }

  const handleSaveAbout = () => {
    updateUser({ about: tempAbout.trim() })
    setIsEditingAbout(false)
  }

  const handleCancelName = () => {
    setTempName(user?.name || "")
    setIsEditingName(false)
  }

  const handleCancelAbout = () => {
    setTempAbout(user?.about || "")
    setIsEditingAbout(false)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">个人资料</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* 头像部分 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{user?.name?.[0] || "我"}</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-green-500 hover:bg-green-600">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">点击更换头像</p>
          </div>

          <Separator />

          {/* 姓名编辑 */}
          <div className="space-y-3">
            <Label className="text-green-600 font-medium">姓名</Label>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1" autoFocus />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelName}>
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-gray-900">{user?.name || "未设置"}</span>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-500">这不是用户名或PIN码。此名称将对您的WhatsApp联系人可见。</p>
          </div>

          <Separator />

          {/* 关于编辑 */}
          <div className="space-y-3">
            <Label className="text-green-600 font-medium">关于</Label>
            {isEditingAbout ? (
              <div className="flex items-center gap-2">
                <Input value={tempAbout} onChange={(e) => setTempAbout(e.target.value)} className="flex-1" autoFocus />
                <Button size="icon" variant="ghost" onClick={handleSaveAbout}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelAbout}>
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <span className="text-gray-900">{user?.about || "嗨，我正在使用 WhatsApp！"}</span>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingAbout(true)}>
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* 联系信息 */}
          <div className="space-y-4">
            <Label className="text-green-600 font-medium">联系信息</Label>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">邮箱</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{user?.email || "未设置"}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">手机号</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{user?.phone || "未设置"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
