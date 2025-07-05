"use client"

import { Phone, Video, MoreVertical, Users, BellOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Contact } from "../types"

interface ChatHeaderProps {
  contact: Contact
  isTyping: boolean
  isGroup: boolean
  onVoiceCall: () => void
  onVideoCall: () => void
  onShowInfo: () => void
}

export function ChatHeader({ contact, isTyping, isGroup, onVoiceCall, onVideoCall, onShowInfo }: ChatHeaderProps) {
  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
          <AvatarFallback>{contact.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium flex items-center gap-2">
            {contact.name}
            {isGroup && <Users className="h-4 w-4 text-gray-500" />}
            {contact.muted && <BellOff className="h-4 w-4 text-gray-400" />}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {contact.isOnline && !isGroup && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>在线</span>
              </>
            )}
            {isGroup && <span>8 位成员</span>}
            {isTyping && <span className="text-green-600">正在输入...</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onVoiceCall}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onVideoCall}>
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onShowInfo}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
