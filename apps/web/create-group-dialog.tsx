"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface Contact {
  id: string
  name: string
  avatar: string
  phone?: string
}

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  onCreateGroup: (name: string, selectedMembers: Contact[]) => void
}

const availableContacts: Contact[] = [
  { id: "1", name: "张三", avatar: "/placeholder.svg?height=40&width=40&text=张", phone: "+86 138 0013 8000" },
  { id: "2", name: "李四", avatar: "/placeholder.svg?height=40&width=40&text=李", phone: "+86 139 0013 9000" },
  { id: "3", name: "王五", avatar: "/placeholder.svg?height=40&width=40&text=王", phone: "+86 137 0013 7000" },
  { id: "4", name: "赵六", avatar: "/placeholder.svg?height=40&width=40&text=赵", phone: "+86 136 0013 6000" },
  { id: "5", name: "钱七", avatar: "/placeholder.svg?height=40&width=40&text=钱", phone: "+86 135 0013 5000" },
]

export function CreateGroupDialog({ isOpen, onClose, onCreateGroup }: CreateGroupDialogProps) {
  const [step, setStep] = useState<"select" | "name">(1)
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([])
  const [groupName, setGroupName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = availableContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleMember = (contact: Contact) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === contact.id) ? prev.filter((m) => m.id !== contact.id) : [...prev, contact],
    )
  }

  const handleNext = () => {
    if (selectedMembers.length > 0) {
      setStep("name")
    }
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName, selectedMembers)
      onClose()
      setStep("select")
      setSelectedMembers([])
      setGroupName("")
    }
  }

  const handleClose = () => {
    onClose()
    setStep("select")
    setSelectedMembers([])
    setGroupName("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>{step === "select" ? "选择联系人" : "群组信息"}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {step === "select" ? (
            <>
              {/* 搜索框 */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索联系人"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 已选择的成员 */}
              {selectedMembers.length > 0 && (
                <div className="p-4 border-b">
                  <p className="text-sm text-gray-600 mb-2">已选择 {selectedMembers.length} 人</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-1 bg-green-100 rounded-full px-2 py-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{member.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => toggleMember(member)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 联系人列表 */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleMember(contact)}
                    >
                      <Checkbox
                        checked={selectedMembers.some((m) => m.id === contact.id)}
                        onChange={() => toggleMember(contact)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* 底部按钮 */}
              <div className="p-4 border-t">
                <Button className="w-full" onClick={handleNext} disabled={selectedMembers.length === 0}>
                  下一步 ({selectedMembers.length})
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* 群组信息设置 */}
              <div className="p-4 space-y-4 flex-1">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">群</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    添加群组头像
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">群组名称</label>
                  <Input placeholder="输入群组名称" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">群组成员 ({selectedMembers.length})</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="p-4 border-t flex gap-2">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                  返回
                </Button>
                <Button onClick={handleCreate} disabled={!groupName.trim()} className="flex-1">
                  创建群组
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
