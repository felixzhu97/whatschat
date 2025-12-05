"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/presentation/components/ui/avatar";
import { Button } from "@/src/presentation/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/presentation/components/ui/dropdown-menu";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Forward,
  Star,
  Info,
  Play,
  Download,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import type { Message } from "../../../types";

interface MessageBubbleProps {
  message: Message;
  isGroup?: boolean;
  // 兼容某些页面传入的属性
  isOwn?: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, text: string) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onStar?: (messageId: string) => void;
  onInfo?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isGroup = false,
  isOwn,
  showAvatar,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onInfo,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isSent = message.senderId === "current-user";

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src="/placeholder.svg?height=200&width=300&text=图片"
              alt="图片消息"
              className="rounded-lg max-w-xs"
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {formatTime(message.timestamp)}
            </div>
          </div>
        );
      case "video":
        return (
          <div className="relative">
            <div className="bg-gray-200 rounded-lg p-4 max-w-xs flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-600" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {formatTime(message.timestamp)}
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3 max-w-xs">
            <Button size="sm" variant="ghost">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="h-2 bg-gray-300 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-1/3"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">0:30</span>
          </div>
        );
      case "file":
        return (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 max-w-xs">
            <FileText className="h-8 w-8 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {message.fileName || "文件"}
              </p>
              <p className="text-xs text-gray-500">
                {message.fileSize || "未知大小"}
              </p>
            </div>
            <Button size="sm" variant="ghost">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return (
          <div>
            <p className="text-sm">{message.content}</p>
            {message.isEdited && (
              <span className="text-xs text-gray-500 italic">已编辑</span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-2 group",
        isSent ? "flex-row-reverse space-x-reverse" : "flex-row"
      )}
    >
      {/* Avatar for received messages in groups */}
      {!isSent && isGroup && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32&text=头像" />
          <AvatarFallback>{message.senderName?.[0] || "U"}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-3 py-2 relative",
          isSent ? "bg-green-500 text-white" : "bg-white border shadow-sm"
        )}
      >
        {/* Sender name for group messages */}
        {!isSent && isGroup && (
          <p className="text-xs font-medium text-gray-600 mb-1">
            {message.senderName}
          </p>
        )}

        {/* Message content */}
        {renderMessageContent()}

        {/* Message time and status */}
        {message.type === "text" && (
          <div
            className={cn(
              "flex items-center justify-end space-x-1 mt-1",
              isSent ? "text-green-100" : "text-gray-500"
            )}
          >
            <span className="text-xs">{formatTime(message.timestamp)}</span>
            {isSent && (
              <div className="flex">
                {message.status === "sent" && (
                  <div className="w-3 h-3 text-green-100">✓</div>
                )}
                {message.status === "delivered" && (
                  <div className="w-3 h-3 text-green-100">✓✓</div>
                )}
                {message.status === "read" && (
                  <div className="w-3 h-3 text-blue-300">✓✓</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message menu */}
        <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                isSent
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-100 hover:bg-gray-200"
              )}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReply && onReply(message)}>
              <Reply className="h-4 w-4 mr-2" />
              回复
            </DropdownMenuItem>
            {isSent && message.type === "text" && (
              <DropdownMenuItem
                onClick={() => onEdit && onEdit(message.id, message.content)}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onForward && onForward(message)}>
              <Forward className="h-4 w-4 mr-2" />
              转发
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStar && onStar(message.id)}>
              <Star className="h-4 w-4 mr-2" />
              收藏
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onInfo && onInfo(message)}>
              <Info className="h-4 w-4 mr-2" />
              信息
            </DropdownMenuItem>
            {isSent && (
              <DropdownMenuItem
                onClick={() => onDelete && onDelete(message.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
