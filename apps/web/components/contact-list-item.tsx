"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Pin, PinOff, Bell, BellOff, Archive, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Contact } from "../types"
import { useLongPress } from "../hooks/use-long-press"

interface ContactListItemProps {
  contact: Contact
  isSelected: boolean
  onSelect: (contact: Contact) => void
  onAction: (action: string, contact: Contact) => void
}

export function ContactListItem({ contact, isSelected, onSelect, onAction }: ContactListItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [localContact, setLocalContact] = useState(contact)
  const itemRef = useRef<HTMLDivElement>(null)

  // 同步外部contact变化
  useEffect(() => {
    setLocalContact(contact)
  }, [contact])

  // 长按检测
  const longPressEvents = useLongPress({
    onLongPress: () => {
      setShowActions(true)
      if ("vibrate" in navigator) {
        navigator.vibrate(50)
      }
    },
    onPress: () => {
      if (!showActions) {
        onSelect(localContact)
      }
    },
    delay: 500,
  })

  // 处理点击外部关闭操作菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("touchstart", handleClickOutside)
      }
    }
  }, [showActions])

  useEffect(() => {
    if (!showMenu) {
      const timeout = setTimeout(() => {
        setShowActions(false)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [showMenu])

  const handleQuickAction = (action: string) => {
    // 立即更新本地状态以提供即时反馈
    if (action === "pin") {
      setLocalContact((prev) => ({ ...prev, pinned: !prev.pinned }))
    } else if (action === "mute") {
      setLocalContact((prev) => ({ ...prev, muted: !prev.muted }))
    }

    // 调用父组件的处理函数
    onAction(action, localContact)
    setShowActions(false)
  }

  return (
    <div
      ref={itemRef}
      className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 relative transition-all duration-200 select-none ${
        isSelected ? "bg-gray-100" : "hover:bg-gray-50"
      } ${showActions ? "bg-blue-50 shadow-md" : ""} ${longPressEvents.isLongPressing ? "scale-95" : ""}`}
      {...longPressEvents}
    >
      {/* 置顶指示器 */}
      {localContact.pinned && <Pin className="absolute top-2 right-2 h-3 w-3 text-green-500" />}

      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={localContact.avatar || "/placeholder.svg"} />
          <AvatarFallback>{localContact.name[0]}</AvatarFallback>
        </Avatar>
        {localContact.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-sm truncate">{localContact.name}</h3>
            {localContact.isGroup && <Users className="h-3 w-3 text-gray-500" />}
            {localContact.muted && <BellOff className="h-3 w-3 text-gray-400" />}
          </div>
          <span className="text-xs text-gray-500">{localContact.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">{localContact.lastMessage}</p>
          <div className="flex items-center gap-1">
            {localContact.isGroup && localContact.memberCount && (
              <span className="text-xs text-gray-400">{localContact.memberCount}人</span>
            )}
            {/* 免打扰时显示小圆点而不是数字 */}
            {localContact.unread && localContact.muted ? (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            ) : localContact.unread && !localContact.muted ? (
              <Badge className="bg-green-500 text-white text-xs">{localContact.unread}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      {/* 长按提示 */}
      {longPressEvents.isLongPressing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 animate-in fade-in-0 duration-200">
          松开显示选项
        </div>
      )}

      {/* 快速操作按钮 */}
      {showActions && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border p-1 flex items-center gap-1 z-10 animate-in slide-in-from-right-2 duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickAction("pin")
            }}
            title={localContact.pinned ? "取消置顶" : "置顶"}
          >
            {localContact.pinned ? <PinOff className="h-3 w-3 text-green-500" /> : <Pin className="h-3 w-3" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              handleQuickAction("mute")
            }}
            title={localContact.muted ? "取消静音" : "静音"}
          >
            {localContact.muted ? <Bell className="h-3 w-3 text-green-500" /> : <BellOff className="h-3 w-3" />}
          </Button>

          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
                title="更多选项"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleQuickAction("archive")}>
                <Archive className="h-4 w-4 mr-2" />
                归档聊天
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleQuickAction("delete")} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                删除聊天
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-gray-100 ml-1 border-l"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(false)
            }}
            title="关闭"
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  )
}
