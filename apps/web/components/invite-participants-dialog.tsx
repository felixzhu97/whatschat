"use client"

import { useState } from "react"
import { X, Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { CallParticipant } from "../types"

interface Contact {
  id: string
  name: string
  avatar: string
  phone?: string
  online?: boolean
}

interface InviteParticipantsDialogProps {
  isOpen: boolean
  onClose: () => void
  currentParticipants: CallParticipant[]
  onInvite: (participants: CallParticipant[]) => void
}

const availableContacts: Contact[] = [
  {
    id: "3",
    name: "王五",
    avatar: "/placeholder.svg?height=40&width=40&text=王",
    phone: "+86 137 0013 7000",
    online: true,
  },
  {
    id: "4",
    name: "赵六",
    avatar: "/placeholder.svg?height=40&width=40&text=赵",
    phone: "+86 136 0013 6000",
    online: false,
  },
  {
    id: "5",
    name: "钱七",
    avatar: "/placeholder.svg?height=40&width=40&text=钱",
    phone: "+86 135 0013 5000",
    online: true,
  },
  {
    id: "6",
    name: "孙八",
    avatar: "/placeholder.svg?height=40&width=40&text=孙",
    phone: "+86 134 0013 4000",
    online: true,
  },
  {
    id: "7",
    name: "周九",
    avatar: "/placeholder.svg?height=40&width=40&text=周",
    phone: "+86 133 0013 3000",
    online: false,
  },
  {
    id: "8",
    name: "吴十",
    avatar: "/placeholder.svg?height=40&width=40&text=吴",
    phone: "+86 132 0013 2000",
    online: true,
  },
]

export function InviteParticipantsDialog({
  isOpen,
  onClose,
  currentParticipants,
  onInvite,
}: InviteParticipantsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  // 过滤掉已经在通话中的联系人
  const currentParticipantIds = currentParticipants.map((p) => p.id)
  const availableForInvite = availableContacts.filter((contact) => !currentParticipantIds.includes(contact.id))

  const filteredContacts = availableForInvite.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleContact = (contact: Contact) => {
    setSelectedContacts((prev) =>
      prev.find((c) => c.id === contact.id) ? prev.filter((c) => c.id !== contact.id) : [...prev, contact],
    )
  }

  const handleInvite = () => {
    const newParticipants: CallParticipant[] = selectedContacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: false,
      isHost: false,
      joinedAt: 0, // 将在邀请后设置
    }))

    onInvite(newParticipants)
    setSelectedContacts([])
    onClose()
  }

  const handleClose = () => {
    setSelectedContacts([])
    setSearchQuery("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>邀请参与者</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

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

          {/* 已选择的联系人 */}
          {selectedContacts.length > 0 && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">已选择 {selectedContacts.length} 人</p>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-1 bg-green-100 rounded-full px-2 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{contact.name}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => toggleContact(contact)}>
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
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">没有可邀请的联系人</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleContact(contact)}
                  >
                    <Checkbox
                      checked={selectedContacts.some((c) => c.id === contact.id)}
                      onChange={() => toggleContact(contact)}
                    />
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{contact.name}</p>
                        {contact.online && <span className="text-xs text-green-600">在线</span>}
                      </div>
                      {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* 底部按钮 */}
          <div className="p-4 border-t">
            <Button className="w-full" onClick={handleInvite} disabled={selectedContacts.length === 0}>
              邀请 ({selectedContacts.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
