"use client"

import { useState } from "react"
import { ArrowLeft, Camera, Edit, Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProfilePageProps {
  onBack: () => void
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [name, setName] = useState("我的名字")
  const [about, setAbout] = useState("忙碌中")
  const [tempName, setTempName] = useState(name)
  const [tempAbout, setTempAbout] = useState(about)

  const handleSaveName = () => {
    setName(tempName)
    setIsEditingName(false)
  }

  const handleSaveAbout = () => {
    setAbout(tempAbout)
    setIsEditingAbout(false)
  }

  const handleCancelName = () => {
    setTempName(name)
    setIsEditingName(false)
  }

  const handleCancelAbout = () => {
    setTempAbout(about)
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
                <AvatarImage src="/placeholder.svg?height=128&width=128&text=我" />
                <AvatarFallback className="text-4xl">我</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-green-500 hover:bg-green-600"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-center max-w-xs">点击更改个人资料照片</p>
          </div>

          {/* 姓名部分 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-600">姓名</label>
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
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <span className="text-lg">{name}</span>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                  <Edit className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-500">这不是用户名或PIN码。此名称将对您的WhatsApp联系人可见。</p>
          </div>

          {/* 关于部分 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-600">关于</label>
            {isEditingAbout ? (
              <div className="space-y-2">
                <Textarea
                  value={tempAbout}
                  onChange={(e) => setTempAbout(e.target.value)}
                  className="resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={handleCancelAbout}>
                    取消
                  </Button>
                  <Button size="sm" onClick={handleSaveAbout}>
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <span>{about}</span>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingAbout(true)}>
                  <Edit className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            )}
          </div>

          {/* 电话号码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-600">电话</label>
            <div className="p-3 border-b border-gray-200">
              <span>+86 138 0013 8000</span>
            </div>
            <p className="text-xs text-gray-500">要更改电话号码，请前往设置 &gt; 账户 &gt; 更改号码。</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
