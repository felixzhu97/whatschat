"use client"

import { useState } from "react"
import { Search, Calendar, FileText, ImageIcon, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Contact } from "../types"

interface AdvancedSearchFilters {
  query: string
  messageTypes: string[]
  contacts: string[]
  dateRange: { from: Date; to: Date } | null
  sender: string
  hasMedia: boolean
  isStarred: boolean
}

interface AdvancedSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (filters: AdvancedSearchFilters) => void
  contacts: Contact[]
}

export function AdvancedSearchDialog({ isOpen, onClose, onSearch, contacts }: AdvancedSearchDialogProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    messageTypes: [],
    contacts: [],
    dateRange: null,
    sender: "",
    hasMedia: false,
    isStarred: false,
  })

  const handleSearch = () => {
    onSearch(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      query: "",
      messageTypes: [],
      contacts: [],
      dateRange: null,
      sender: "",
      hasMedia: false,
      isStarred: false,
    })
  }

  const toggleMessageType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(type)
        ? prev.messageTypes.filter((t) => t !== type)
        : [...prev.messageTypes, type],
    }))
  }

  const toggleContact = (contactId: string) => {
    setFilters((prev) => ({
      ...prev,
      contacts: prev.contacts.includes(contactId)
        ? prev.contacts.filter((c) => c !== contactId)
        : [...prev.contacts, contactId],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            高级搜索
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 搜索关键词 */}
          <div className="space-y-2">
            <Label htmlFor="query">搜索关键词</Label>
            <Input
              id="query"
              placeholder="输入要搜索的内容..."
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            />
          </div>

          {/* 消息类型 */}
          <div className="space-y-3">
            <Label>消息类型</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "text", label: "文本消息", icon: <FileText className="h-4 w-4" /> },
                { type: "image", label: "图片", icon: <ImageIcon className="h-4 w-4" /> },
                { type: "file", label: "文件", icon: <FileText className="h-4 w-4" /> },
                { type: "voice", label: "语音消息", icon: <Mic className="h-4 w-4" /> },
              ].map(({ type, label, icon }) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.messageTypes.includes(type)}
                    onCheckedChange={() => toggleMessageType(type)}
                  />
                  <label htmlFor={type} className="text-sm flex items-center gap-2 cursor-pointer">
                    {icon}
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 选择聊天 */}
          <div className="space-y-3">
            <Label>选择聊天</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={contact.id}
                    checked={filters.contacts.includes(contact.id)}
                    onCheckedChange={() => toggleContact(contact.id)}
                  />
                  <label htmlFor={contact.id} className="flex items-center gap-2 cursor-pointer flex-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{contact.name}</span>
                    {contact.isGroup && <span className="text-xs text-gray-500">(群组)</span>}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 发送者 */}
          <div className="space-y-2">
            <Label htmlFor="sender">发送者</Label>
            <Input
              id="sender"
              placeholder="输入发送者名称..."
              value={filters.sender}
              onChange={(e) => setFilters((prev) => ({ ...prev, sender: e.target.value }))}
            />
          </div>

          {/* 日期范围 */}
          <div className="space-y-2">
            <Label>日期范围</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateRange
                    ? `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                    : "选择日期范围"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: range as { from: Date; to: Date } | null,
                    }))
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 其他选项 */}
          <div className="space-y-3">
            <Label>其他选项</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedia"
                  checked={filters.hasMedia}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasMedia: checked as boolean }))}
                />
                <label htmlFor="hasMedia" className="text-sm cursor-pointer">
                  包含媒体文件
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStarred"
                  checked={filters.isStarred}
                  onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, isStarred: checked as boolean }))}
                />
                <label htmlFor="isStarred" className="text-sm cursor-pointer">
                  仅星标消息
                </label>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSearch} disabled={!filters.query.trim()}>
              搜索
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
