"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Search, Filter, Calendar, FileText, ImageIcon, Mic, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import type { Message, Contact } from "../types"
import { Users } from "lucide-react" // Declare the Users variable

interface SearchResult {
  message: Message
  contact: Contact
  matchType: "content" | "sender" | "file"
  highlightText?: string
}

interface MessageSearchPageProps {
  onBack: () => void
  onSelectMessage: (contactId: string, messageId: string) => void
  contacts: Contact[]
  getAllMessages: () => { contactId: string; messages: Message[] }[]
}

export function MessageSearchPage({ onBack, onSelectMessage, contacts, getAllMessages }: MessageSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    messageTypes: [] as string[],
    contacts: [] as string[],
    dateRange: null as { from: Date; to: Date } | null,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<"relevance" | "date">("relevance")

  // 获取所有消息数据
  const allMessagesData = useMemo(() => {
    return getAllMessages()
  }, [getAllMessages])

  // 搜索功能
  const performSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    allMessagesData.forEach(({ contactId, messages }) => {
      const contact = contacts.find((c) => c.id === contactId)
      if (!contact) return

      // 应用联系人过滤器
      if (selectedFilters.contacts.length > 0 && !selectedFilters.contacts.includes(contactId)) {
        return
      }

      messages.forEach((message) => {
        // 应用消息类型过滤器
        if (selectedFilters.messageTypes.length > 0 && !selectedFilters.messageTypes.includes(message.type)) {
          return
        }

        // 应用日期过滤器
        if (selectedFilters.dateRange) {
          const messageDate = new Date(message.time)
          if (messageDate < selectedFilters.dateRange.from || messageDate > selectedFilters.dateRange.to) {
            return
          }
        }

        let matchType: "content" | "sender" | "file" = "content"
        let highlightText = ""

        // 搜索消息内容
        if (message.text && message.text.toLowerCase().includes(query)) {
          matchType = "content"
          highlightText = message.text
          results.push({ message, contact, matchType, highlightText })
        }
        // 搜索发送者名称
        else if (message.senderName && message.senderName.toLowerCase().includes(query)) {
          matchType = "sender"
          highlightText = message.senderName
          results.push({ message, contact, matchType, highlightText })
        }
        // 搜索文件名
        else if (message.fileName && message.fileName.toLowerCase().includes(query)) {
          matchType = "file"
          highlightText = message.fileName
          results.push({ message, contact, matchType, highlightText })
        }
        // 搜索联系人名称
        else if (contact.name.toLowerCase().includes(query)) {
          matchType = "sender"
          highlightText = contact.name
          results.push({ message, contact, matchType, highlightText })
        }
      })
    })

    // 排序结果
    if (sortBy === "date") {
      results.sort((a, b) => new Date(b.message.time).getTime() - new Date(a.message.time).getTime())
    } else {
      // 按相关性排序（简单实现：完全匹配优先）
      results.sort((a, b) => {
        const aExact = a.highlightText?.toLowerCase() === query
        const bExact = b.highlightText?.toLowerCase() === query
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return new Date(b.message.time).getTime() - new Date(a.message.time).getTime()
      })
    }

    setSearchResults(results)
    setIsSearching(false)
  }, [searchQuery, selectedFilters, sortBy, allMessagesData, contacts])

  // 执行搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300) // 防抖

    return () => clearTimeout(timeoutId)
  }, [performSearch])

  // 高亮搜索文本
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString("zh-CN")
    }
  }

  // 获取消息类型图标
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "file":
        return <FileText className="h-4 w-4" />
      case "voice":
        return <Mic className="h-4 w-4" />
      default:
        return null
    }
  }

  // 清除过滤器
  const clearFilters = () => {
    setSelectedFilters({
      messageTypes: [],
      contacts: [],
      dateRange: null,
    })
  }

  // 切换消息类型过滤器
  const toggleMessageType = (type: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(type)
        ? prev.messageTypes.filter((t) => t !== type)
        : [...prev.messageTypes, type],
    }))
  }

  // 切换联系人过滤器
  const toggleContact = (contactId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      contacts: prev.contacts.includes(contactId)
        ? prev.contacts.filter((c) => c !== contactId)
        : [...prev.contacts, contactId],
    }))
  }

  const hasActiveFilters =
    selectedFilters.messageTypes.length > 0 || selectedFilters.contacts.length > 0 || selectedFilters.dateRange

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-green-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">搜索消息</h1>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
          <Input
            placeholder="搜索消息、联系人或文件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/70 hover:text-white"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 过滤器和排序 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`text-white hover:bg-white/20 ${hasActiveFilters ? "bg-white/20" : ""}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              过滤器
              {hasActiveFilters && <Badge className="ml-2 bg-white text-green-600">!</Badge>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/20">
                清除
              </Button>
            )}
          </div>

          <Select value={sortBy} onValueChange={(value: "relevance" | "date") => setSortBy(value)}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">相关性</SelectItem>
              <SelectItem value="date">时间</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 过滤器面板 */}
      {showFilters && (
        <div className="bg-gray-50 border-b p-4 space-y-4">
          {/* 消息类型过滤器 */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">消息类型</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "text", label: "文本", icon: null },
                { type: "image", label: "图片", icon: <ImageIcon className="h-3 w-3" /> },
                { type: "file", label: "文件", icon: <FileText className="h-3 w-3" /> },
                { type: "voice", label: "语音", icon: <Mic className="h-3 w-3" /> },
              ].map(({ type, label, icon }) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={selectedFilters.messageTypes.includes(type)}
                    onCheckedChange={() => toggleMessageType(type)}
                  />
                  <label htmlFor={type} className="text-sm flex items-center gap-1 cursor-pointer">
                    {icon}
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 联系人过滤器 */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">联系人</h3>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={contact.id}
                    checked={selectedFilters.contacts.includes(contact.id)}
                    onCheckedChange={() => toggleContact(contact.id)}
                  />
                  <label htmlFor={contact.id} className="text-sm flex items-center gap-2 cursor-pointer truncate">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    {contact.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 日期范围过滤器 */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">日期范围</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedFilters.dateRange
                    ? `${selectedFilters.dateRange.from.toLocaleDateString()} - ${selectedFilters.dateRange.to.toLocaleDateString()}`
                    : "选择日期范围"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={selectedFilters.dateRange}
                  onSelect={(range) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      dateRange: range as { from: Date; to: Date } | null,
                    }))
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      <div className="flex-1 overflow-hidden">
        {!searchQuery.trim() ? (
          /* 搜索提示 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-600 mb-2">搜索消息</h2>
              <p className="text-gray-500 max-w-sm">输入关键词搜索所有聊天中的消息、联系人或文件名</p>
              <div className="mt-4 text-sm text-gray-400">
                <p>搜索技巧：</p>
                <ul className="mt-2 space-y-1">
                  <li>• 输入消息内容搜索文本</li>
                  <li>• 输入联系人名称搜索聊天</li>
                  <li>• 输入文件名搜索文件</li>
                  <li>• 使用过滤器缩小搜索范围</li>
                </ul>
              </div>
            </div>
          </div>
        ) : isSearching ? (
          /* 搜索中 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">搜索中...</p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          /* 无结果 */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-600 mb-2">未找到结果</h2>
              <p className="text-gray-500">没有找到包含 "{searchQuery}" 的消息</p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
                  清除过滤器重新搜索
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* 搜索结果列表 */
          <div className="flex-1">
            {/* 结果统计 */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                找到 <span className="font-medium">{searchResults.length}</span> 条相关消息
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.contact.id}-${result.message.id}-${index}`}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSelectMessage(result.contact.id, result.message.id)}
                  >
                    {/* 聊天信息 */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-sm">{result.contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{result.contact.name}</h3>
                          {result.contact.isGroup && <Users className="h-3 w-3 text-gray-500" />}
                          {getMessageTypeIcon(result.message.type)}
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(result.message.time)}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {result.matchType === "content" && "内容"}
                        {result.matchType === "sender" && "发送者"}
                        {result.matchType === "file" && "文件"}
                      </Badge>
                    </div>

                    {/* 消息预览 */}
                    <div className="ml-11">
                      {result.message.type === "text" ? (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {highlightText(result.message.text, searchQuery)}
                        </p>
                      ) : result.message.type === "image" ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span>图片</span>
                          {result.message.text && (
                            <>
                              <span>-</span>
                              <span>{highlightText(result.message.text, searchQuery)}</span>
                            </>
                          )}
                        </div>
                      ) : result.message.type === "file" ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>{highlightText(result.message.fileName || "文件", searchQuery)}</span>
                          {result.message.fileSize && (
                            <span className="text-gray-400">({result.message.fileSize})</span>
                          )}
                        </div>
                      ) : result.message.type === "voice" ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mic className="h-4 w-4" />
                          <span>语音消息</span>
                          {result.message.duration && (
                            <span className="text-gray-400">({Math.floor(result.message.duration)}秒)</span>
                          )}
                        </div>
                      ) : null}

                      {/* 发送者信息（群组消息） */}
                      {result.contact.isGroup && result.message.senderName && (
                        <p className="text-xs text-gray-500 mt-1">
                          发送者: {highlightText(result.message.senderName, searchQuery)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
