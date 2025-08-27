"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Search, Clock, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Contact } from "../types";
import { useLongPress } from "../hooks/use-long-press";

interface SearchSuggestion {
  id: string;
  type: "contact" | "recent" | "hashtag" | "command";
  title: string;
  subtitle?: string;
  avatar?: string;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  query: string;
  contacts: Contact[];
  recentSearches: string[];
  onSelect: (suggestion: SearchSuggestion) => void;
  onClearRecentSearches?: () => void;
  onRemoveRecent?: (search: string) => void;
  onAdvancedSearch?: () => void;
}

export function SearchSuggestions({
  query,
  contacts,
  recentSearches,
  onSelect,
  onClearRecentSearches,
  onRemoveRecent,
  onAdvancedSearch,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [longPressIndex, setLongPressIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressEvents = useLongPress({
    onLongPress: (index: number, suggestion: SearchSuggestion) => {
      setLongPressIndex(index);
      if (suggestion.type === "recent" && onRemoveRecent) {
        onRemoveRecent(suggestion.title);
      }
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    onPress: (suggestion: SearchSuggestion) => onSelect(suggestion),
    delay: 500,
  });

  useEffect(() => {
    const newSuggestions: SearchSuggestion[] = [];

    if (!query.trim()) {
      // 显示最近搜索
      recentSearches.slice(0, 5).forEach((search, index) => {
        newSuggestions.push({
          id: `recent-${index}`,
          type: "recent",
          title: search,
          icon: <Clock className="h-4 w-4" />,
        });
      });

      // 显示搜索命令
      const commands = [
        { id: "from", title: "from:", subtitle: "搜索特定联系人的消息" },
        { id: "type", title: "type:", subtitle: "按消息类型搜索" },
        { id: "date", title: "date:", subtitle: "按日期搜索" },
      ];

      commands.forEach((cmd) => {
        newSuggestions.push({
          id: `command-${cmd.id}`,
          type: "command",
          title: cmd.title,
          subtitle: cmd.subtitle,
          icon: <Hash className="h-4 w-4" />,
        });
      });
    } else {
      // 搜索联系人
      const matchingContacts = contacts
        .filter((contact) =>
          contact.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);

      matchingContacts.forEach((contact) => {
        newSuggestions.push({
          id: `contact-${contact.id}`,
          type: "contact",
          title: contact.name,
          subtitle: contact.isGroup
            ? `群组 • ${contact.memberCount} 位成员`
            : "联系人",
          avatar: contact.avatar,
        });
      });

      // 搜索建议
      if (query.length >= 2) {
        const searchSuggestions = [
          `在所有聊天中搜索 "${query}"`,
          `在图片中搜索 "${query}"`,
          `在文件中搜索 "${query}"`,
        ];

        searchSuggestions.forEach((suggestion, index) => {
          newSuggestions.push({
            id: `search-${index}`,
            type: "command",
            title: suggestion,
            icon: <Search className="h-4 w-4" />,
          });
        });
      }
    }

    setSuggestions(newSuggestions);
    setHoveredIndex(-1);
  }, [query, contacts, recentSearches]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHoveredIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHoveredIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (hoveredIndex >= 0 && hoveredIndex < suggestions.length) {
            onSelect(suggestions[hoveredIndex]);
          }
          break;
        case "Escape":
          setHoveredIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, hoveredIndex, onSelect]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-80 overflow-hidden"
    >
      <ScrollArea className="max-h-80">
        <div className="py-2">
          {!query.trim() && recentSearches.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-gray-600">
                  最近搜索
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecentSearches}
                  className="text-xs text-gray-500 h-6"
                  disabled={!onClearRecentSearches}
                >
                  清除
                </Button>
              </div>
              <Separator />
            </>
          )}

          {suggestions.map((suggestion, index) => {
            return (
              <div key={suggestion.id}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 select-none ${
                    hoveredIndex === index ? "bg-gray-100" : "hover:bg-gray-50"
                  } ${longPressIndex === index ? "bg-red-50 scale-95" : ""}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={() =>
                    longPressEvents.onPress &&
                    longPressEvents.onPress(suggestion)
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (suggestion.type === "recent" && onRemoveRecentSearch) {
                      longPressEvents.onLongPress &&
                        longPressEvents.onLongPress(index, suggestion);
                    }
                  }}
                >
                  {suggestion.avatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={suggestion.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-sm">
                        {suggestion.title[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                      {suggestion.icon}
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </p>
                    {suggestion.subtitle && (
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.subtitle}
                      </p>
                    )}
                  </div>
                  {suggestion.type === "recent" && (
                    <div className="text-xs text-gray-400">长按删除</div>
                  )}
                </div>
                {index < suggestions.length - 1 &&
                  suggestion.type !== suggestions[index + 1]?.type && (
                    <Separator />
                  )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
