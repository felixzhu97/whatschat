import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MessageService } from '../../src/services/message'

// Mock the database client module
vi.mock('../../src/database/client', () => ({
  prisma: {
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    chat: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Import the mocked prisma
const { prisma: mockPrisma } = await import('../../src/database/client')

describe('MessageService - Simple', () => {
  let messageService: MessageService

  beforeEach(() => {
    vi.clearAllMocks()
    messageService = new MessageService()
  })

  describe('createMessage', () => {
    it('should create a text message successfully', async () => {
      const messageData = {
        content: 'Hello, world!',
        type: 'text' as const,
        senderId: 'sender-id',
        chatId: 'chat-id',
      }

      const mockMessage = {
        id: 'message-id',
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: 'sender-id',
          name: 'Test User',
          avatar: null,
        },
      }

      const mockChat = {
        id: 'chat-id',
        type: 'private',
        name: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.chat.findUnique.mockResolvedValue(mockChat)
      mockPrisma.message.create.mockResolvedValue(mockMessage)
      mockPrisma.chat.update.mockResolvedValue(mockChat)

      const result = await messageService.createMessage(messageData)

      expect(result).toEqual(mockMessage)
      expect(mockPrisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: messageData.chatId },
      })
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: messageData,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })
    })

    it('should throw error if chat does not exist', async () => {
      const messageData = {
        content: 'Hello, world!',
        type: 'text' as const,
        senderId: 'sender-id',
        chatId: 'non-existent-chat-id',
      }

      mockPrisma.chat.findUnique.mockResolvedValue(null)

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        '聊天不存在'
      )

      expect(mockPrisma.message.create).not.toHaveBeenCalled()
    })
  })

  describe('getMessages', () => {
    it('should get messages for a chat successfully', async () => {
      const chatId = 'chat-id'
      const options = {
        page: 1,
        limit: 20,
      }

      const mockMessages = [
        {
          id: 'message-1',
          content: 'Hello',
          type: 'text',
          senderId: 'user-1',
          chatId: 'chat-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: 'user-1',
            name: 'User 1',
            avatar: null,
          },
        },
        {
          id: 'message-2',
          content: 'Hi there',
          type: 'text',
          senderId: 'user-2',
          chatId: 'chat-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: 'user-2',
            name: 'User 2',
            avatar: null,
          },
        },
      ]

      mockPrisma.message.findMany.mockResolvedValue(mockMessages)

      const result = await messageService.getMessages(chatId, options)

      expect(result).toEqual(mockMessages)
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })

    it('should handle pagination correctly', async () => {
      const chatId = 'chat-id'
      const options = {
        page: 3,
        limit: 10,
      }

      const mockMessages = [
        {
          id: 'message-1',
          content: 'Hello',
          type: 'text',
          senderId: 'user-1',
          chatId: 'chat-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: 'user-1',
            name: 'User 1',
            avatar: null,
          },
        },
      ]

      mockPrisma.message.findMany.mockResolvedValue(mockMessages)

      const result = await messageService.getMessages(chatId, options)

      expect(result).toEqual(mockMessages)
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 20, // (page - 1) * limit = (3 - 1) * 10 = 20
        take: 10,
      })
    })

    it('should search messages by content', async () => {
      const chatId = 'chat-id'
      const options = {
        page: 1,
        limit: 20,
        search: 'hello',
      }

      const mockMessages = [
        {
          id: 'message-1',
          content: 'Hello world',
          type: 'text',
          senderId: 'user-1',
          chatId: 'chat-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: 'user-1',
            name: 'User 1',
            avatar: null,
          },
        },
      ]

      mockPrisma.message.findMany.mockResolvedValue(mockMessages)

      const result = await messageService.getMessages(chatId, options)

      expect(result).toEqual(mockMessages)
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatId,
          content: {
            contains: 'hello',
            mode: 'insensitive',
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })
  })

  describe('updateMessage', () => {
    it('should update message successfully', async () => {
      const messageId = 'message-id'
      const updateData = {
        content: 'Updated message content',
      }

      const mockUpdatedMessage = {
        id: messageId,
        content: updateData.content,
        type: 'text',
        senderId: 'user-id',
        chatId: 'chat-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: 'user-id',
          name: 'Test User',
          avatar: null,
        },
      }

      mockPrisma.message.update.mockResolvedValue(mockUpdatedMessage)

      const result = await messageService.updateMessage(messageId, updateData)

      expect(result).toEqual(mockUpdatedMessage)
      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })
    })
  })

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      const messageId = 'message-id'

      const mockMessage = {
        id: messageId,
        content: 'Test message',
        type: 'text',
        senderId: 'user-id',
        chatId: 'chat-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.message.delete.mockResolvedValue(mockMessage)

      const result = await messageService.deleteMessage(messageId)

      expect(result).toEqual(mockMessage)
      expect(mockPrisma.message.delete).toHaveBeenCalledWith({
        where: { id: messageId },
      })
    })
  })

  describe('markAsRead', () => {
    it('should mark messages as read successfully', async () => {
      const chatId = 'chat-id'
      const userId = 'user-id'

      const mockMessages = [
        {
          id: 'message-1',
          content: 'Hello',
          type: 'text',
          senderId: 'other-user',
          chatId: 'chat-id',
          readAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.message.findMany.mockResolvedValue(mockMessages)

      const result = await messageService.markAsRead(chatId, userId)

      expect(result).toBe(true)
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatId,
          senderId: { not: userId },
          readAt: null,
        },
      })
    })
  })
})