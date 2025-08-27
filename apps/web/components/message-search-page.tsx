"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  ImageIcon,
  Video,
  Mic,
  File,
} from "lucide-react";
import type { Contact, Message } from "../types";

interface MessageSearchPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  allMessages: Array<{
    contactId: string;
    messages: Message[];
  }>;
  contacts: Contact[];
  onSelectMessage: (contactId: string, messageId: string) => void;
}

interface SearchResult {
  message: Message;
  contact: Contact;
  matchedText: string;
}

export function MessageSearchPage({
  isOpen,
  onClose,
  initialQuery = "",
  allMessages,
  contacts,
  onSelectMessage,
}: MessageSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filters = [
    { id: "all", name: "全部", icon: Search },
    { id: "text", name: "文本", icon: FileText },
    { id: "image", name: "图片", icon: ImageIcon },
    { id: "video", name: "视频", icon: Video },
    { id: "audio", name: "语音", icon: Mic },
    { id: "file", name: "文件", icon: File },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilter]);

  const performSearch = async (query: string) => {
    setIsSearching(true);

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results: SearchResult[] = [];

    allMessages.forEach(({ contactId, messages }) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      messages.forEach((message) => {
        // Filter by message type
        if (selectedFilter !== "all" && message.type !== selectedFilter) {
          return;
        }

        // Search in message content
        if (message.content.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            message,
            contact,
            matchedText: highlightMatch(message.content, query),
          });
        }
      });
    });

    // Sort by date (newest first)
    results.sort(
      (a, b) =>
        new Date(b.message.timestamp).getTime() -
        new Date(a.message.timestamp).getTime()
    );

    setSearchResults(results);
    setIsSearching(false);
  };

  const highlightMatch = (text: string, query: string): string => {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return messageDate.toLocaleDateString("zh-CN");
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "file":
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索消息..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          const isSelected = selectedFilter === filter.id;
          return (
            <Button
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => setSelectedFilter(filter.id)}
            >
              <IconComponent className="h-4 w-4" />
              {filter.name}
            </Button>
          );
        })}
      </div>

      {/* Search Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">搜索中...</p>
            </div>
          ) : searchQuery.trim() === "" ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">搜索消息</h3>
              <p>输入关键词搜索聊天记录</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">没有找到结果</h3>
              <p>尝试使用其他关键词</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  找到 {searchResults.length} 条相关消息
                </p>
              </div>

              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.message.id}-${index}`}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() =>
                      onSelectMessage(result.contact.id, result.message.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={result.contact.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {result.contact.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {result.contact.name}
                          </p>
                          {result.contact.isGroup && (
                            <Badge variant="secondary" className="text-xs">
                              群组
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-gray-500">
                            {getMessageTypeIcon(result.message.type)}
                            <span className="text-xs">
                              {formatDate(result.message.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {result.message.type === "text" ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: result.matchedText,
                              }}
                              className="line-clamp-2"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {getMessageTypeIcon(result.message.type)}
                              <span>{result.message.content}</span>
                            </div>
                          )}
                        </div>
                        {result.message.senderName &&
                          result.contact.isGroup && (
                            <p className="text-xs text-gray-500 mt-1">
                              {result.message.senderName}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
