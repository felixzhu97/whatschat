"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Clock, Smile, Heart, Star, X } from "lucide-react"

interface EmojiPickerProps {
  isOpen: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
}

const emojiCategories = {
  recent: {
    name: "最近使用",
    icon: Clock,
    emojis: ["😀", "😂", "😍", "🥰", "😊", "😉", "😎", "🤔", "😴", "😋"],
  },
  smileys: {
    name: "表情",
    icon: Smile,
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
  },
  hands: {
    name: "手势",
    icon: X,
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉"],
  },
  hearts: {
    name: "心形",
    icon: Heart,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
  },
  items: {
    name: "物品",
    icon: Star,
    emojis: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🎯", "⚽", "🏀", "🎮"],
  },
}

export function EmojiPicker({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentEmojis, setRecentEmojis] = useState<string[]>([])
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 初始化最近使用的表情
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentEmojis")
      if (saved) {
        setRecentEmojis(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Failed to load recent emojis:", error)
      setRecentEmojis([])
    }
  }, [])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)

    // 更新最近使用的表情
    const updatedRecent = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 24)
    setRecentEmojis(updatedRecent)
    try {
      localStorage.setItem("recentEmojis", JSON.stringify(updatedRecent))
    } catch (error) {
      console.error("Failed to save recent emojis:", error)
    }

    // 选择表情后不关闭面板，让用户可以连续选择
    // onClose() // 注释掉这行，让用户可以连续选择表情
  }

  const filteredEmojis = searchQuery
    ? Object.values(emojiCategories).flatMap((category) =>
        category.emojis.filter((emoji) => emoji.includes(searchQuery)),
      )
    : []

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border w-80 h-96 z-50 animate-in slide-in-from-bottom-2 duration-200"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-gray-900">表情符号</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索表情符号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </div>

      {searchQuery ? (
        /* 搜索结果 */
        <ScrollArea className="h-80 p-3">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-all duration-150 hover:scale-110"
                onClick={() => handleEmojiClick(emoji)}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                onMouseLeave={() => setHoveredEmoji(null)}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
          {filteredEmojis.length === 0 && <div className="text-center text-gray-500 py-8">没有找到匹配的表情符号</div>}
        </ScrollArea>
      ) : (
        /* 分类浏览 */
        <Tabs defaultValue="recent" className="h-80">
          <TabsList className="grid w-full grid-cols-7 h-10 mx-3 mt-2">
            {Object.entries(emojiCategories).map(([key, category]) => {
              const IconComponent = category.icon
              return (
                <TabsTrigger key={key} value={key} className="p-1" title={category.name}>
                  <IconComponent className="h-4 w-4" />
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(emojiCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="h-64 mt-2">
              <ScrollArea className="h-full p-3">
                <div className="grid grid-cols-8 gap-1">
                  {(key === "recent" ? recentEmojis : category.emojis).map((emoji, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => handleEmojiClick(emoji)}
                      onMouseEnter={() => setHoveredEmoji(emoji)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      title={emoji}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
                {key === "recent" && recentEmojis.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>暂无最近使用的表情</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* 悬停预览 */}
      {hoveredEmoji && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
          {hoveredEmoji}
        </div>
      )}
    </div>
  )
}
