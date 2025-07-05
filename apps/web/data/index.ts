import { mockContacts } from "./mock-contacts"
import { mockMessages } from "./mock-messages"
import { mockCalls } from "./mock-calls"
import { mockStatus } from "./mock-status"
import type { Contact, Message } from "../types"

// 导出所有数据
export { mockContacts, mockMessages, mockCalls, mockStatus }

// 工具函数
export const getContactById = (id: string): Contact | undefined => {
  return mockContacts.find((contact) => contact.id === id)
}

export const getMessagesForContact = (contactId: string): Message[] => {
  return mockMessages[contactId] || []
}

export const getCallsForContact = (contactId: string) => {
  return mockCalls.filter((call) => call.contactId === contactId)
}

export const getStatusForContact = (contactId: string) => {
  return mockStatus.filter((status) => status.contactId === contactId)
}

// 搜索功能
export const searchContacts = (query: string): Contact[] => {
  if (!query.trim()) return mockContacts

  const lowercaseQuery = query.toLowerCase()
  return mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      (contact.lastMessage && contact.lastMessage.toLowerCase().includes(lowercaseQuery)),
  )
}

export const searchMessages = (query: string, contactId?: string): Message[] => {
  if (!query.trim()) return []

  const lowercaseQuery = query.toLowerCase()
  const allMessages = contactId ? getMessagesForContact(contactId) : Object.values(mockMessages).flat()

  return allMessages.filter((message) => message.content.toLowerCase().includes(lowercaseQuery))
}

// 获取所有消息（用于全局搜索）
export const getAllMessages = () => {
  return mockContacts.map((contact) => ({
    contactId: contact.id,
    messages: getMessagesForContact(contact.id),
  }))
}

// 获取未读消息数量
export const getUnreadCount = (contactId: string): number => {
  const contact = getContactById(contactId)
  return contact?.unreadCount || 0
}

// 获取最近联系人
export const getRecentContacts = (limit = 5): Contact[] => {
  return mockContacts
    .filter((contact) => contact.lastMessage)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

// 获取在线联系人
export const getOnlineContacts = (): Contact[] => {
  return mockContacts.filter((contact) => contact.isOnline && !contact.isGroup)
}

// 获取群组列表
export const getGroups = (): Contact[] => {
  return mockContacts.filter((contact) => contact.isGroup)
}
