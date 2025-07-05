"use client"

import { useState } from "react"
import { ArrowLeft, Plus, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "../hooks/use-auth"

interface Status {
  id: string
  name: string
  avatar: string
  timestamp: Date
  viewed: boolean
  isOwn?: boolean
}

interface StatusPageProps {
  onBack: () => void
}

export function StatusPage({ onBack }: StatusPageProps) {
  const { user } = useAuth()

  // 模拟状态数据
  const [statuses] = useState<Status[]>([
    {
      id: "own",
      name: "我的状态",
      avatar: user?.avatar || "/placeholder.svg?height=40&width=40&text=我",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
      viewed: true,
      isOwn: true,
    },
    {
      id: "1",
      name: "张三",
      avatar: "/placeholder.svg?height=40&width=40&text=张",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      viewed: false,
    },
    {
      id: "2",
      name: "李四",
      avatar: "/placeholder.svg?height=40&width=40&text=李",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
      viewed: true,
    },
    {
      id: "3",
      name: "王五",
      avatar: "/placeholder.svg?height=40&width=40&text=王",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3小时前
      viewed: false,
    },
  ])

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
      return `${diffInMinutes}分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  const recentStatuses = statuses.filter((s) => !s.isOwn && !s.viewed)
  const viewedStatuses = statuses.filter((s) => !s.isOwn && s.viewed)
  const myStatus = statuses.find((s) => s.isOwn)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">状态</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* 我的状态 */}
          {myStatus && (
            <div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={myStatus.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{myStatus.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{myStatus.name}</h3>
                  <p className="text-sm text-gray-600">{formatTimestamp(myStatus.timestamp)}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 最近更新 */}
          {recentStatuses.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-3 px-3">最近更新</h2>
              <div className="space-y-2">
                {recentStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={status.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full border-2 border-green-500"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{status.name}</h3>
                      <p className="text-sm text-gray-600">{formatTimestamp(status.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已查看 */}
          {viewedStatuses.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-600 mb-3 px-3">已查看</h2>
              <div className="space-y-2">
                {viewedStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer opacity-60"
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={status.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{status.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{status.name}</h3>
                      <p className="text-sm text-gray-600">{formatTimestamp(status.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
