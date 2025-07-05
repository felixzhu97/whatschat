"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, TouchpadIcon as TouchIcon } from "lucide-react"

export function LongPressGuide() {
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    // 检查是否已经显示过指导
    const hasShownGuide = localStorage.getItem("longPressGuideShown")
    if (!hasShownGuide) {
      // 延迟显示指导
      const timer = setTimeout(() => {
        setShowGuide(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setShowGuide(false)
    localStorage.setItem("longPressGuideShown", "true")
  }

  if (!showGuide) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">使用提示</h3>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TouchIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">长按消息</p>
                <p className="text-sm text-gray-600">长按消息气泡显示快速操作菜单</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TouchIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">长按聊天</p>
                <p className="text-sm text-gray-600">长按聊天列表项显示管理选项</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">💡 提示：长按时会有轻微震动反馈，松开手指即可显示操作选项</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleClose}>知道了</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
