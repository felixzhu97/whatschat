"use client";

import { useState } from "react";
import { ArrowLeft, Star, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import type { Message } from "../types";

interface StarredMessage extends Message {
  chatName: string;
  chatAvatar: string;
}

interface StarredMessagesPageProps {
  onBack: () => void;
}

export function StarredMessagesPage({ onBack }: StarredMessagesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 模拟星标消息数据
  const [starredMessages] = useState<StarredMessage[]>([
    {
      id: "1",
      content: "记得明天的会议时间是下午2点",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
      senderId: "user1",
      type: "text",
      status: "read",
      chatName: "张三",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=张",
    },
    {
      id: "2",
      content: "这个项目的截止日期是下周五",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2天前
      senderId: "user2",
      type: "text",
      status: "read",
      chatName: "李四",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=李",
    },
    {
      id: "3",
      content: "/placeholder.svg?height=200&width=300&text=重要图片",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3天前
      senderId: "user3",
      type: "image",
      status: "read",
      chatName: "工作群",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=工",
    },
    {
      id: "4",
      content: "生日聚会地址：中山路123号",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4天前
      senderId: "user4",
      type: "text",
      status: "read",
      chatName: "王五",
      chatAvatar: "/placeholder.svg?height=40&width=40&text=王",
    },
  ]);

  // 过滤星标消息
  const filteredMessages = starredMessages.filter(
    (message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: string) => {
    const now = new Date();
    const ts = new Date(timestamp);
    const diffInDays = Math.floor(
      (now.getTime() - ts.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return "今天";
    } else if (diffInDays === 1) {
      return "昨天";
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-green-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">星标消息</h1>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索星标消息"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredMessages.length > 0 ? (
          <div className="p-4 space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* 聊天信息 */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={message.chatAvatar || "/placeholder.svg"}
                    />
                    <AvatarFallback className="text-xs">
                      {message.chatName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{message.chatName}</span>
                  <span>•</span>
                  <span>{formatDate(message.timestamp)}</span>
                  <Star className="h-3 w-3 text-yellow-500 fill-current ml-auto" />
                </div>

                {/* 消息内容 */}
                <div className="ml-8">
                  <MessageBubble
                    message={message}
                    isOwn={false}
                    showAvatar={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-600 mb-2">
                没有星标消息
              </h2>
              <p className="text-gray-500">
                {searchQuery
                  ? "没有找到匹配的星标消息"
                  : "点击消息旁的星标图标来收藏重要消息"}
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
