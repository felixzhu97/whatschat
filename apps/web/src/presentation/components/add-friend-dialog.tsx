"use client"

import { useState } from "react"
import { Button } from "@/src/presentation/components/ui/button"
import { Input } from "@/src/presentation/components/ui/input"
import { Label } from "@/src/presentation/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/presentation/components/ui/tabs"
import { ScrollArea } from "@/src/presentation/components/ui/scroll-area"
import { Textarea } from "@/src/presentation/components/ui/textarea"
import { X, Search, UserPlus, QrCode, MapPin, Clock, Phone } from "lucide-react"

interface AddFriendDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddFriend: (friendId: string) => void
}

// Mock data for demonstration
const mockSearchResults = [
  {
    id: "user1",
    name: "王小明",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    phone: "+86 138 0001 0001",
    mutualFriends: 3,
  },
  {
    id: "user2",
    name: "李小红",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    phone: "+86 139 0002 0002",
    mutualFriends: 1,
  },
]

const mockNearbyUsers = [
  {
    id: "nearby1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    distance: "50米",
  },
  {
    id: "nearby2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    distance: "120米",
  },
]

const mockRecentContacts = [
  {
    id: "recent1",
    name: "赵五",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    lastContact: "2天前",
  },
  {
    id: "recent2",
    name: "钱六",
    avatar: "/placeholder.svg?height=40&width=40&text=钱",
    lastContact: "1周前",
  },
]

export function AddFriendDialog({ isOpen, onClose, onAddFriend }: AddFriendDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addMessage, setAddMessage] = useState("你好，我想加你为好友")

  if (!isOpen) return null

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setSearchResults(
        mockSearchResults.filter((user) => user.name.includes(searchQuery) || user.phone.includes(searchQuery)),
      )
      setIsSearching(false)
    }, 1000)
  }

  const handleAddFriend = (userId: string) => {
    onAddFriend(userId)
    console.log("Adding friend:", userId, "with message:", addMessage)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">添加好友</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
              <TabsTrigger value="search" className="flex flex-col gap-1 py-2">
                <Search className="h-4 w-4" />
                <span className="text-xs">搜索</span>
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex flex-col gap-1 py-2">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">附近</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex flex-col gap-1 py-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs">最近</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex flex-col gap-1 py-2">
                <QrCode className="h-4 w-4" />
                <span className="text-xs">扫码</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-4 px-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">搜索用户</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="输入手机号或用户名"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? "搜索中..." : "搜索"}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-64">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                            {user.mutualFriends > 0 && (
                              <p className="text-xs text-blue-600">{user.mutualFriends} 个共同好友</p>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                            <UserPlus className="h-4 w-4 mr-1" />
                            添加
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>没有找到相关用户</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>输入手机号或用户名搜索好友</p>
                    </div>
                  )}
                </ScrollArea>

                <div className="space-y-2">
                  <Label htmlFor="message">添加好友消息</Label>
                  <Textarea
                    id="message"
                    placeholder="输入验证消息"
                    value={addMessage}
                    onChange={(e) => setAddMessage(e.target.value)}
                    rows={2}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{addMessage.length}/100</p>
                </div>
              </div>
            </TabsContent>

            {/* Nearby Tab */}
            <TabsContent value="nearby" className="mt-4 px-4">
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  <div className="text-center py-4">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">正在搜索附近的人...</p>
                  </div>
                  {mockNearbyUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>距离 {user.distance}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="mt-4 px-4">
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {mockRecentContacts.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>最后联系：{user.lastContact}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* QR Code Tab */}
            <TabsContent value="qr" className="mt-4 px-4">
              <div className="text-center py-8 space-y-4">
                <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-2">我的二维码</p>
                  <p className="text-sm text-gray-500">扫描上方二维码，加我为好友</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <QrCode className="h-4 w-4 mr-2" />
                  扫描二维码
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
