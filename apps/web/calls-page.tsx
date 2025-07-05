"use client"

import { ArrowLeft, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Call {
  id: string
  name: string
  avatar: string
  type: "incoming" | "outgoing" | "missed"
  callType: "voice" | "video"
  time: string
  duration?: string
}

interface CallsPageProps {
  onBack: () => void
}

const calls: Call[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    type: "outgoing",
    callType: "voice",
    time: "今天 14:30",
    duration: "5分钟",
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    type: "incoming",
    callType: "video",
    time: "今天 12:15",
    duration: "12分钟",
  },
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    type: "missed",
    callType: "voice",
    time: "昨天 18:45",
  },
  {
    id: "4",
    name: "项目讨论组",
    avatar: "/placeholder.svg?height=40&width=40&text=项目",
    type: "outgoing",
    callType: "video",
    time: "昨天 15:20",
    duration: "25分钟",
  },
]

export function CallsPage({ onBack }: CallsPageProps) {
  const getCallIcon = (type: string, callType: string) => {
    const iconClass = `h-4 w-4 ${type === "missed" ? "text-red-500" : "text-green-500"}`

    if (type === "incoming") {
      return <PhoneIncoming className={iconClass} />
    } else if (type === "outgoing") {
      return <PhoneOutgoing className={iconClass} />
    } else {
      return <PhoneMissed className={iconClass} />
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
        <div className="p-4">
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无通话记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={call.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{call.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{call.name}</h3>
                      {getCallIcon(call.type, call.callType)}
                      {call.callType === "video" && <Video className="h-3 w-3 text-gray-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{call.time}</span>
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{call.duration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
