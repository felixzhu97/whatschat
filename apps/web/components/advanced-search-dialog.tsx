"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";
import type { Contact } from "../types";

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  query: string;
  contact: string;
  messageType: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  hasMedia: boolean;
}

export function AdvancedSearchDialog({
  isOpen,
  onClose,
  contacts = [],
  onSearch,
}: AdvancedSearchDialogProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    contact: "all", // Updated default value
    messageType: "all", // Updated default value
    dateFrom: undefined,
    dateTo: undefined,
    hasMedia: false,
  });

  // Ensure contacts is always an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: "",
      contact: "all", // Updated default value
      messageType: "all", // Updated default value
      dateFrom: undefined,
      dateTo: undefined,
      hasMedia: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            高级搜索
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">搜索内容</Label>
            <Input
              id="query"
              placeholder="输入要搜索的内容..."
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
            />
          </div>

          {/* Contact Filter */}
          <div className="space-y-2">
            <Label>联系人</Label>
            <Select
              value={filters.contact}
              onValueChange={(value) =>
                setFilters({ ...filters, contact: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择联系人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有联系人</SelectItem>
                {safeContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Type Filter */}
          <div className="space-y-2">
            <Label>消息类型</Label>
            <Select
              value={filters.messageType}
              onValueChange={(value) =>
                setFilters({ ...filters, messageType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择消息类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="text">文本消息</SelectItem>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="audio">语音</SelectItem>
                <SelectItem value="file">文件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(filters.dateFrom, "PPP")
                      : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) =>
                      setFilters({ ...filters, dateFrom: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>结束日期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(filters.dateTo, "PPP")
                      : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) =>
                      setFilters({ ...filters, dateTo: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              重置
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
