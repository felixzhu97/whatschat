"use client"

import type React from "react"
import {
  Search,
  MoreVertical,
  Phone,
  Users,
  UserPlus,
  Star,
  Wifi,
  WifiOff,
  Settings,
  Archive,
  Filter,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ContactListItem } from "./contact-list-item"
import { SearchSuggestions } from "./search-suggestions"
import type { Contact, User } from "../types"

interface SidebarProps {
  user: User | null
  contacts: Contact[]
  selectedContact: Contact | null
  searchQuery: string
  isConnected: boolean
  showSearchSuggestions: boolean
  recentSearches: string[]
  onContactSelect: (contact: Contact) => void
  onContactAction: (action: string, contact: Contact) => void
  onSearchChange: (query: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
  onGlobalSearch: (query: string) => void
  onSearchSuggestion: (suggestion: any) => void
  onRemoveRecentSearch: (search: string) => void
  onProfileClick: () => void
  onStatusClick: () => void
  onCallsClick: () => void
  onAddFriendClick: () => void
  onCreateGroupClick: () => void
  onSearchPageClick: () => void
  onAdvancedSearchClick: () => void
  onStarredClick: () => void
  onSettingsClick: () => void
  searchInputRef: React.RefObject<HTMLInputElement>
}

export function Sidebar({
  user,
  contacts = [],
  selectedContact,
  searchQuery = "",
  isConnected = false,
  showSearchSuggestions = false,
  recentSearches = [],
  onContactSelect,
  onContactAction,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onGlobalSearch,
  onSearchSuggestion,
  onRemoveRecentSearch,
  onProfileClick,
  onStatusClick,
  onCallsClick,
  onAddFriendClick,
  onCreateGroupClick,
  onSearchPageClick,
  onAdvancedSearchClick,
  onStarredClick,
  onSettingsClick,
  searchInputRef,
}: SidebarProps) {
  // 安全地过滤联系人，添加空值检查
  const filteredContacts = contacts.filter((contact) => {
    if (!contact) return false

    const name = contact.name || ""
    const lastMessage = contact.lastMessage || ""
    const query = searchQuery || ""

    return name.toLowerCase().includes(query.toLowerCase()) || lastMessage.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
      {/* 头部 */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={onProfileClick}>
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&text=我"} />
              <AvatarFallback>{user?.name?.[0] || "我"}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <span className="text-xs text-gray-500">{isConnected ? "已连接" : "连接中..."}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStatusClick}>
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCallsClick}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddFriendClick}>
              <UserPlus className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCreateGroupClick}>
                  <Users className="h-4 w-4 mr-2" />
                  新建群组
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSearchPageClick}>
                  <Search className="h-4 w-4 mr-2" />
                  搜索消息
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAdvancedSearchClick}>
                  <Filter className="h-4 w-4 mr-2" />
                  高级搜索
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onStarredClick}>
                  <Star className="h-4 w-4 mr-2" />
                  星标消息
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  已归档
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick}>
                  <Settings className="h-4 w-4 mr-2" />
                  设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="搜索或开始新聊天"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onGlobalSearch(searchQuery)
              }
            }}
            className="pl-10 bg-white"
          />

          {/* 搜索建议 */}
          {showSearchSuggestions && (
            <SearchSuggestions
              query={searchQuery}
              contacts={contacts}
              recentSearches={recentSearches}
              onSelect={onSearchSuggestion}
              onRemoveRecent={onRemoveRecentSearch}
              onAdvancedSearch={onAdvancedSearchClick}
            />
          )}
        </div>
      </div>

      {/* 联系人列表 */}
      <ScrollArea className="flex-1">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">{searchQuery ? "未找到匹配的联系人" : "暂无联系人"}</div>
        ) : (
          filteredContacts
            .sort((a, b) => {
              // 置顶的联系人排在前面
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              return 0
            })
            .map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onSelect={onContactSelect}
                onAction={onContactAction}
              />
            ))
        )}
      </ScrollArea>
    </div>
  )
}
