"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Button } from "@/src/presentation/components/ui/button"
import { ScrollArea } from "@/src/presentation/components/ui/scroll-area"
import { Badge } from "@/src/presentation/components/ui/badge"

interface CallRecord {
  id: string
  name: string
  avatar: string
  type: "incoming" | "outgoing" | "missed"
  callType: "voice" | "video"
  timestamp: Date
  duration?: number
}

interface CallsPageProps {
  onBack: () => void
}

export function CallsPage({ onBack }: CallsPageProps) {
  // 模拟通话记录数据
  const [callRecords] = useState<CallRecord[]>([
    {
      id: "1",
      name: "张三",
      avatar: "/placeholder.svg?height=40&width=40&text=张",
      type: "outgoing",
      callType: "video",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      duration: 1200, // 20分钟
    },
    {
      id: "2",
      name: "李四",
      avatar: "/placeholder.svg?height=40&width=40&text=李",
      type: "incoming",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
      duration: 300, // 5分钟
    },
    {
      id: "3",
      name: "王五",
      avatar: "/placeholder.svg?height=40&width=40&text=王",
      type: "missed",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
    },
    {
      id: "4",
      name: "赵六",
      avatar: "/placeholder.svg?height=40&width=40&text=赵",
      type: "outgoing",
      callType: "voice",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
      duration: 600, // 10分钟
    },
  ])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

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

  const getCallIcon = (record: CallRecord) => {
    const iconClass = "h-4 w-4"

    if (record.type === "missed") {
      return <PhoneMissed className={`${iconClass} text-red-500`} />
    } else if (record.type === "incoming") {
      return <PhoneIncoming className={`${iconClass} text-green-500`} />
    } else {
      return <PhoneOutgoing className={`${iconClass} text-blue-500`} />
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">通话</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {callRecords.map((record) => (
            <div key={record.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
              <Avatar className="h-12 w-12">
                <AvatarImage src={record.avatar || "/placeholder.svg"} />
                <AvatarFallback>{record.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{record.name}</h3>
                  {record.type === "missed" && (
                    <Badge variant="destructive" className="text-xs">
                      未接
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getCallIcon(record)}
                  <span>{formatTimestamp(record.timestamp)}</span>
                  {record.duration && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(record.duration)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
