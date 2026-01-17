/**
 * WhatsApp 相关数据工厂
 * 用于生成测试用的用户、消息、聊天等数据
 */

import { createFactory, Factory } from './base';

/**
 * 用户数据接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 消息数据接口
 */
export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  senderId: string;
  chatId: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 聊天数据接口
 */
export interface Chat {
  id: string;
  type: 'private' | 'group';
  name: string | null;
  avatar: string | null;
  lastMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 联系人数据接口
 */
export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  alias: string | null;
  createdAt: Date;
  updatedAt: Date;
}

let userCounter = 0;
let messageCounter = 0;
let chatCounter = 0;
let contactCounter = 0;

/**
 * 生成唯一 ID
 */
function generateId(prefix: string, counter: number): string {
  return `${prefix}-${counter}`;
}

/**
 * 用户数据工厂
 * 
 * @example
 * ```typescript
 * const user = userFactory();
 * const customUser = userFactory({ name: 'Custom Name', email: 'custom@example.com' });
 * ```
 */
export const userFactory: Factory<User> = createFactory(() => {
  userCounter += 1;
  const now = new Date();
  return {
    id: generateId('user', userCounter),
    email: `user${userCounter}@example.com`,
    name: `User ${userCounter}`,
    phone: `+123456789${userCounter.toString().padStart(2, '0')}`,
    avatar: null,
    status: 'online',
    lastSeen: now,
    createdAt: now,
    updatedAt: now,
  };
});

/**
 * 消息数据工厂
 * 
 * @example
 * ```typescript
 * const message = messageFactory();
 * const customMessage = messageFactory({ content: 'Hello', senderId: 'user-1' });
 * ```
 */
export const messageFactory: Factory<Message> = createFactory(() => {
  messageCounter += 1;
  const now = new Date();
  return {
    id: generateId('message', messageCounter),
    content: `Test message ${messageCounter}`,
    type: 'text',
    senderId: generateId('user', (messageCounter % 2) + 1),
    chatId: generateId('chat', 1),
    readAt: null,
    createdAt: new Date(now.getTime() - (messageCounter * 60000)), // 1 minute apart
    updatedAt: new Date(now.getTime() - (messageCounter * 60000)),
  };
});

/**
 * 聊天数据工厂
 * 
 * @example
 * ```typescript
 * const chat = chatFactory();
 * const groupChat = chatFactory({ type: 'group', name: 'Group Chat' });
 * ```
 */
export const chatFactory: Factory<Chat> = createFactory(() => {
  chatCounter += 1;
  const now = new Date();
  return {
    id: generateId('chat', chatCounter),
    type: chatCounter === 1 ? 'group' : 'private',
    name: chatCounter === 1 ? `Group Chat ${chatCounter}` : null,
    avatar: null,
    lastMessageId: generateId('message', chatCounter),
    createdAt: now,
    updatedAt: now,
  };
});

/**
 * 联系人数据工厂
 * 
 * @example
 * ```typescript
 * const contact = contactFactory();
 * const customContact = contactFactory({ userId: 'user-1', contactId: 'user-2' });
 * ```
 */
export const contactFactory: Factory<Contact> = createFactory(() => {
  contactCounter += 1;
  const now = new Date();
  return {
    id: generateId('contact', contactCounter),
    userId: generateId('user', 1),
    contactId: generateId('user', contactCounter + 1),
    alias: null,
    createdAt: now,
    updatedAt: now,
  };
});
