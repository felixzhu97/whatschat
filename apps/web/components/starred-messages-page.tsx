"use client"

import { ArrowLeft, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StarredMessage {
  id: string
  text: string
  sender: string
  senderAvatar: string
  time: string
  date: string
  chatName: string
}

interface StarredMessagesPageProps {
  onBack: () => void
}

const starredMessages: StarredMessage[] = [
  {
    id: "1",
    text: "记得明天下午3点开会",
    sender: "李四",
    senderAvatar: "/placeholder.svg?height=32&width=32&text=李",
    time: "14:30",
    date: "今天",
    chatName: "项目讨论组",
  },
  {
    id: "2",
    text: "这个方案很不错，我们可以试试",
    sender: "张三",
    senderAvatar: "/placeholder.svg?height=32&width=32&text=张",
    time: "16:45",
    date: "昨天",
    chatName: "张三",
  },
  {
    id: "3",
    text: "地址：北京市朝阳区xxx路xxx号",
    sender: "王五",
    senderAvatar: "/placeholder.svg?height=32&width=32&text=王",
    time: "10:20",
    date: "周二",
    chatName: "王五",
  },
]

export function StarredMessagesPage({ onBack }: StarredMessagesPageProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">星标消息</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {starredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">暂无星标消息</p>
              <p className="text-sm text-gray-500">点击并按住任何消息，然后点击星标图标来添加星标消息。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {starredMessages.map((message) => (
                <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{message.sender}</h3>
                        <span className="text-xs text-gray-500">来自 {message.chatName}</span>
                      </div>

                      <p className="text-sm text-gray-900 mb-2">{message.text}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {message.date} {message.time}
                        </span>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    </div>
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
