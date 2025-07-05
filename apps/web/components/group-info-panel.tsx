"use client"

import { useState } from "react"
import { X, Users, UserPlus, Settings, Crown, UserMinus, Edit, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: "admin" | "member"
  phone?: string
}

interface GroupInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupAvatar: string
  groupDescription: string
  members: GroupMember[]
  memberCount: number
  isAdmin: boolean
}

export function GroupInfoPanel({
  isOpen,
  onClose,
  groupName,
  groupAvatar,
  groupDescription,
  members,
  memberCount,
  isAdmin,
}: GroupInfoPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(groupName)
  const [editedDescription, setEditedDescription] = useState(groupDescription)
  const [showAddMember, setShowAddMember] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>群组信息</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* 群组头像和名称 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={groupAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{groupName[0]}</AvatarFallback>
                  </Avatar>
                  {isAdmin && (
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-green-500 hover:bg-green-600"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="text-center space-y-2 w-full">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-center font-medium"
                      />
                      <Input
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="群组描述"
                        className="text-center text-sm"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" onClick={() => setIsEditing(false)}>
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <h2 className="text-xl font-medium">{groupName}</h2>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{groupDescription}</p>
                      <p className="text-sm text-gray-500">{memberCount} 位成员</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 群组操作 */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowAddMember(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  添加成员
                </Button>
                {isAdmin && (
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    群组设置
                  </Button>
                )}
              </div>

              {/* 成员列表 */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  成员 ({memberCount})
                </h3>

                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{member.name}</p>
                            {member.role === "admin" && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                管理员
                              </Badge>
                            )}
                          </div>
                          {member.phone && <p className="text-xs text-gray-500">{member.phone}</p>}
                        </div>
                      </div>

                      {isAdmin && member.role !== "admin" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 退出群组 */}
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  退出群组
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
