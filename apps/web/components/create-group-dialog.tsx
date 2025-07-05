"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { X, Search, Users, Camera, ArrowLeft, ArrowRight } from "lucide-react"
import type { Contact } from "../types"

interface CreateGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  onCreateGroup: (name: string, selectedMembers: Contact[]) => void
}

export function CreateGroupDialog({ isOpen, onClose, contacts, onCreateGroup }: CreateGroupDialogProps) {
  const [step, setStep] = useState<"select" | "info">("select")
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null)

  if (!isOpen) return null

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleMemberToggle = (contact: Contact) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((member) => member.id === contact.id)
      if (isSelected) {
        return prev.filter((member) => member.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const handleNext = () => {
    if (selectedMembers.length > 0) {
      setStep("info")
    }
  }

  const handleBack = () => {
    setStep("select")
  }

  const handleCreate = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), selectedMembers)
      // Reset form
      setStep("select")
      setSelectedMembers([])
      setSearchQuery("")
      setGroupName("")
      setGroupDescription("")
      setGroupAvatar(null)
    }
  }

  const handleClose = () => {
    // Reset form
    setStep("select")
    setSelectedMembers([])
    setSearchQuery("")
    setGroupName("")
    setGroupDescription("")
    setGroupAvatar(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {step === "info" && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === "select" ? "选择群成员" : "群组信息"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {step === "select" ? (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索联系人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selected members preview */}
            {selectedMembers.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">已选择 {selectedMembers.length} 人</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                        onClick={() => handleMemberToggle(member)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact list */}
            <ScrollArea className="flex-1 max-h-96">
              <div className="p-4 space-y-2">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedMembers.some((member) => member.id === contact.id)
                  return (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleMemberToggle(contact)}
                    >
                      <Checkbox checked={isSelected} onChange={() => {}} />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </div>
                  )
                })}
                {filteredContacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>没有找到联系人</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full" onClick={handleNext} disabled={selectedMembers.length === 0}>
                下一步 ({selectedMembers.length})
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Group info form */}
            <ScrollArea className="flex-1 max-h-96">
              <div className="p-4 space-y-4">
                {/* Group avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={groupAvatar || ""} />
                      <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                        <Users className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-transparent"
                      onClick={() => {
                        // In a real app, this would open a file picker
                        console.log("Open avatar picker")
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">点击添加群头像</p>
                </div>

                {/* Group name */}
                <div className="space-y-2">
                  <Label htmlFor="groupName">群组名称 *</Label>
                  <Input
                    id="groupName"
                    placeholder="输入群组名称"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500">{groupName.length}/50</p>
                </div>

                {/* Group description */}
                <div className="space-y-2">
                  <Label htmlFor="groupDescription">群组描述</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="输入群组描述（可选）"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">{groupDescription.length}/200</p>
                </div>

                {/* Selected members summary */}
                <div className="space-y-2">
                  <Label>群成员 ({selectedMembers.length + 1})</Label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {/* Current user */}
                      <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">我</AvatarFallback>
                        </Avatar>
                        <span>我（群主）</span>
                      </div>
                      {/* Selected members */}
                      {selectedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                  返回
                </Button>
                <Button className="flex-1" onClick={handleCreate} disabled={!groupName.trim()}>
                  创建群组
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
