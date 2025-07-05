"use client"

import { useState } from "react"
import { Search, MoreVertical, Phone, Video, Paperclip, Mic, Send, Smile } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
}

interface Message {
  id: string
  text: string
  time: string
  sent: boolean
  delivered?: boolean
  read?: boolean
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    lastMessage: "你好，今天有空吗？",
    time: "14:30",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "好的，明天见！",
    time: "12:15",
  },
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    lastMessage: "文件已发送",
    time: "昨天",
    online: true,
  },
  {
    id: "4",
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    lastMessage: "谢谢你的帮助",
    time: "昨天",
  },
  {
    id: "5",
    name: "钱七",
    avatar: "/placeholder.svg?height=40&width=40&text=钱",
    lastMessage: "周末一起吃饭吧",
    time: "周二",
  },
]

const messages: Message[] = [
  {
    id: "1",
    text: "你好！",
    time: "14:25",
    sent: false,
  },
  {
    id: "2",
    text: "你好，有什么事吗？",
    time: "14:26",
    sent: true,
    delivered: true,
    read: true,
  },
  {
    id: "3",
    text: "今天有空吗？想约你一起吃饭",
    time: "14:28",
    sent: false,
  },
  {
    id: "4",
    text: "当然可以！几点？在哪里？",
    time: "14:30",
    sent: true,
    delivered: true,
    read: true,
  },
  {
    id: "5",
    text: "晚上7点，在市中心那家川菜馆怎么样？",
    time: "14:32",
    sent: false,
  },
]

export default function WhatsAppWeb() {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messageText, setMessageText] = useState("")

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* 头部 */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40&text=我" />
              <AvatarFallback>我</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="搜索或开始新聊天" className="pl-10 bg-gray-100 border-none" />
          </div>
        </div>

        {/* 联系人列表 */}
        <ScrollArea className="flex-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedContact.id === contact.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  {contact.unread && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{selectedContact.name}</h2>
              <p className="text-sm text-gray-500">{selectedContact.online ? "在线" : "上次在线时间：今天 14:30"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 消息区域 */}
        <ScrollArea
          className="flex-1 p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: "#efeae2",
          }}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    message.sent ? "bg-green-500 text-white" : "bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 ${
                      message.sent ? "text-green-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">{message.time}</span>
                    {message.sent && (
                      <div className="flex">
                        <div
                          className={`w-3 h-3 ${message.read ? "text-blue-200" : message.delivered ? "text-green-200" : "text-green-300"}`}
                        >
                          ✓✓
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="输入消息"
                className="pr-12 bg-white"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // 这里可以添加发送消息的逻辑
                    setMessageText("")
                  }
                }}
              />
            </div>

            {messageText.trim() ? (
              <Button size="icon" className="bg-green-500 hover:bg-green-600">
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
