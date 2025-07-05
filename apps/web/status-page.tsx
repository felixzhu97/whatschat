"use client"
import { ArrowLeft, Plus, Eye, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Status {
  id: string
  name: string
  avatar: string
  time: string
  viewed: boolean
  isMyStatus?: boolean
}

interface StatusPageProps {
  onBack: () => void
}

const myStatus: Status[] = [
  {
    id: "my1",
    name: "我的状态",
    avatar: "/placeholder.svg?height=40&width=40&text=我",
    time: "2小时前",
    viewed: true,
    isMyStatus: true,
  },
]

const recentStatuses: Status[] = [
  {
    id: "1",
    name: "张三",
    avatar: "/placeholder.svg?height=40&width=40&text=张",
    time: "30分钟前",
    viewed: false,
  },
  {
    id: "2",
    name: "李四",
    avatar: "/placeholder.svg?height=40&width=40&text=李",
    time: "1小时前",
    viewed: true,
  },
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    time: "3小时前",
    viewed: false,
  },
]

const viewedStatuses: Status[] = [
  {
    id: "4",
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    time: "昨天",
    viewed: true,
  },
  {
    id: "5",
    name: "钱七",
    avatar: "/placeholder.svg?height=40&width=40&text=钱",
    time: "昨天",
    viewed: true,
  },
]

export function StatusPage({ onBack }: StatusPageProps) {
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
          <div className="space-y-3">
            {myStatus.map((status) => (
              <div key={status.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={status.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{status.name[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">我的状态</h3>
                  <p className="text-sm text-gray-600">{status.time}</p>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="pl-4">
              <Button variant="ghost" className="text-green-600 hover:text-green-700 p-0 h-auto">
                <Plus className="h-4 w-4 mr-2" />
                添加状态更新
              </Button>
            </div>
          </div>

          {/* 最近更新 */}
          {recentStatuses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-600 px-2">最近更新</h2>
              {recentStatuses.map((status) => (
                <div key={status.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={status.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{status.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute inset-0 rounded-full border-2 ${
                        status.viewed ? "border-gray-300" : "border-green-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{status.name}</h3>
                    <p className="text-sm text-gray-600">{status.time}</p>
                  </div>

                  {status.viewed && <Eye className="h-4 w-4 text-gray-400" />}
                </div>
              ))}
            </div>
          )}

          {/* 已查看的状态 */}
          {viewedStatuses.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-600 px-2">已查看的状态</h2>
              {viewedStatuses.map((status) => (
                <div key={status.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={status.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{status.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{status.name}</h3>
                    <p className="text-sm text-gray-600">{status.time}</p>
                  </div>

                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
