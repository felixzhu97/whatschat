"use client"

import { useState } from "react"
import { Search, MoreVertical, Phone, Video, Paperclip, Mic, Send, Smile, Users, UserPlus, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GroupInfoPanel } from "./group-info-panel"
import { CreateGroupDialog } from "./create-group-dialog"
import { SettingsPage } from "./settings-page"
import { ProfilePage } from "./profile-page"
import { CallsPage } from "./calls-page"
import { StatusPage } from "./status-page"
import { StarredMessagesPage } from "./starred-messages-page"

interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
  isGroup?: boolean
  members?: GroupMember[]
  memberCount?: number
  description?: string
  admin?: string[]
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: "admin" | "member"
  phone?: string
}

interface Message {
  id: string
  text: string
  time: string
  sent: boolean
  delivered?: boolean
  read?: boolean
  sender?: string
  senderName?: string
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
    id: "group1",
    name: "项目讨论组",
    avatar: "/placeholder.svg?height=40&width=40&text=项目",
    lastMessage: "李四: 明天的会议改到下午3点",
    time: "15:20",
    unread: 5,
    isGroup: true,
    memberCount: 8,
    description: "项目开发讨论群组",
    admin: ["user1", "user2"],
    members: [
      { id: "user1", name: "张三", avatar: "/placeholder.svg?height=32&width=32&text=张", role: "admin" },
      { id: "user2", name: "李四", avatar: "/placeholder.svg?height=32&width=32&text=李", role: "admin" },
      { id: "user3", name: "王五", avatar: "/placeholder.svg?height=32&width=32&text=王", role: "member" },
      { id: "user4", name: "赵六", avatar: "/placeholder.svg?height=32&width=32&text=赵", role: "member" },
    ],
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    lastMessage: "好的，明天见！",
    time: "12:15",
  },
  {
    id: "group2",
    name: "家庭群",
    avatar: "/placeholder.svg?height=40&width=40&text=家庭",
    lastMessage: "妈妈: 晚饭做了你爱吃的菜",
    time: "18:30",
    unread: 1,
    isGroup: true,
    memberCount: 5,
    description: "温馨的家庭群聊",
    admin: ["mom"],
    members: [
      { id: "mom", name: "妈妈", avatar: "/placeholder.svg?height=32&width=32&text=妈", role: "admin" },
      { id: "dad", name: "爸爸", avatar: "/placeholder.svg?height=32&width=32&text=爸", role: "member" },
      { id: "me", name: "我", avatar: "/placeholder.svg?height=32&width=32&text=我", role: "member" },
    ],
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

const groupMessages: Message[] = [
  {
    id: "1",
    text: "大家好，今天的会议有什么要讨论的吗？",
    time: "14:25",
    sent: false,
    sender: "user2",
    senderName: "李四",
  },
  {
    id: "2",
    text: "我觉得我们需要重新评估项目时间线",
    time: "14:26",
    sent: true,
    delivered: true,
    read: true,
  },
  {
    id: "3",
    text: "同意，现在的进度确实有点紧张",
    time: "14:28",
    sent: false,
    sender: "user3",
    senderName: "王五",
  },
  {
    id: "4",
    text: "那我们明天下午3点开会详细讨论一下",
    time: "14:30",
    sent: false,
    sender: "user2",
    senderName: "李四",
  },
]

export default function WhatsAppWeb() {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0])
  const [messageText, setMessageText] = useState("")
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [currentMessages, setCurrentMessages] = useState<Message[]>(messages)
  const [currentPage, setCurrentPage] = useState<"chat" | "settings" | "profile" | "calls" | "status" | "starred">(
    "chat",
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {currentPage === "chat" ? (
        <>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("status")}>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("calls")}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCreateGroup(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentPage("settings")}>
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
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                        {contact.isGroup && <Users className="h-3 w-3 text-gray-500" />}
                      </div>
                      <span className="text-xs text-gray-500">{contact.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                      <div className="flex items-center gap-1">
                        {contact.isGroup && contact.memberCount && (
                          <span className="text-xs text-gray-400">{contact.memberCount}人</span>
                        )}
                        {contact.unread && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {contact.unread}
                          </span>
                        )}
                      </div>
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
              <div
                className="flex items-center gap-3"
                onClick={() => selectedContact.isGroup && setShowGroupInfo(true)}
                className={selectedContact.isGroup ? "cursor-pointer" : ""}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <h2 className="font-medium">{selectedContact.name}</h2>
                    {selectedContact.isGroup && <Users className="h-4 w-4 text-gray-500" />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isGroup
                      ? `${selectedContact.memberCount} 位成员`
                      : selectedContact.online
                        ? "在线"
                        : "上次在线时间：今天 14:30"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage("starred")}>
                  <Star className="h-5 w-5" />
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
                {(selectedContact.isGroup ? groupMessages : messages).map((message) => (
                  <div key={message.id} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sent ? "bg-green-500 text-white" : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      {!message.sent && selectedContact.isGroup && message.senderName && (
                        <p className="text-xs font-medium text-green-600 mb-1">{message.senderName}</p>
                      )}
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
        </>
      ) : currentPage === "settings" ? (
        <SettingsPage onBack={() => setCurrentPage("chat")} onProfileClick={() => setCurrentPage("profile")} />
      ) : currentPage === "profile" ? (
        <ProfilePage onBack={() => setCurrentPage("settings")} />
      ) : currentPage === "calls" ? (
        <CallsPage onBack={() => setCurrentPage("chat")} />
      ) : currentPage === "status" ? (
        <StatusPage onBack={() => setCurrentPage("chat")} />
      ) : currentPage === "starred" ? (
        <StarredMessagesPage onBack={() => setCurrentPage("chat")} />
      ) : null}
      {/* 群组信息面板 */}
      {selectedContact.isGroup && (
        <GroupInfoPanel
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          groupName={selectedContact.name}
          groupAvatar={selectedContact.avatar}
          groupDescription={selectedContact.description || ""}
          members={selectedContact.members || []}
          memberCount={selectedContact.memberCount || 0}
          isAdmin={true}
        />
      )}

      {/* 创建群组对话框 */}
      <CreateGroupDialog
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        contacts={[]}
        onCreateGroup={(name, members) => {
          console.log("创建群组:", name, members)
          // 这里可以添加创建群组的逻辑
        }}
      />
    </div>
  )
}
