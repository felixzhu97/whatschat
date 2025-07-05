"use client"

import { useState } from "react"
import { Search, UserPlus, Phone, Mail, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddFriendDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddFriend: (friendId: string) => void
}

interface SearchResult {
  id: string
  name: string
  avatar: string
  phone?: string
  email?: string
  mutualFriends?: number
  isAdded?: boolean
}

const mockSearchResults: SearchResult[] = [
  {
    id: "search1",
    name: "王小明",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    phone: "+86 138****1234",
    mutualFriends: 3,
  },
  {
    id: "search2",
    name: "李小红",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    email: "lixiaohong@example.com",
    mutualFriends: 1,
  },
  {
    id: "search3",
    name: "张大伟",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    phone: "+86 139****5678",
    isAdded: true,
  },
]

const nearbyUsers: SearchResult[] = [
  {
    id: "nearby1",
    name: "陈小华",
    avatar: "/placeholder.svg?height=40&width=40&text=陈",
    phone: "+86 137****9999",
  },
  {
    id: "nearby2",
    name: "刘小芳",
    avatar: "/placeholder.svg?height=40&width=40&text=刘",
    phone: "+86 136****8888",
  },
]

export function AddFriendDialog({ isOpen, onClose, onAddFriend }: AddFriendDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // 模拟搜索延迟
    setTimeout(() => {
      const filtered = mockSearchResults.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery) ||
          user.email?.includes(searchQuery),
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 1000)
  }

  const handleAddFriend = (friendId: string) => {
    onAddFriend(friendId)
    // 更新搜索结果状态
    setSearchResults((prev) => prev.map((user) => (user.id === friendId ? { ...user, isAdded: true } : user)))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            添加好友
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">搜索</TabsTrigger>
            <TabsTrigger value="nearby">附近的人</TabsTrigger>
            <TabsTrigger value="qr">扫一扫</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="手机号、邮箱或用户名"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? "搜索中..." : "搜索"}
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                        {user.mutualFriends && <p className="text-xs text-gray-400">{user.mutualFriends} 个共同好友</p>}
                      </div>
                      <div>
                        {user.isAdded ? (
                          <Badge variant="secondary">已添加</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                            添加
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>未找到相关用户</p>
                  <p className="text-sm">请检查输入的信息是否正确</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>输入手机号、邮箱或用户名搜索好友</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">发现附近的WhatsApp用户</p>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {nearbyUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{user.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                      <p className="text-xs text-gray-400">距离约 100m</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                      添加
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center py-8">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">扫描二维码添加好友</h3>
              <p className="text-sm text-gray-600 mb-4">打开相机扫描对方的二维码，或让对方扫描你的二维码</p>
              <div className="space-y-2">
                <Button className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  打开相机扫描
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  显示我的二维码
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
