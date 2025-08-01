import { vi } from 'vitest'

/**
 * Test helper utilities for server tests
 */

export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  res.cookie = vi.fn().mockReturnValue(res)
  res.clearCookie = vi.fn().mockReturnValue(res)
  return res
}

export const createMockNext = () => vi.fn()

export const mockPrismaClient = () => ({
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  message: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  chat: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  contact: {
    create: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn(),
})

export const mockRedisClient = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  flushall: vi.fn(),
  hget: vi.fn(),
  hset: vi.fn(),
  hdel: vi.fn(),
  sadd: vi.fn(),
  srem: vi.fn(),
  smembers: vi.fn(),
})

export const mockSocketIO = () => ({
  on: vi.fn(),
  emit: vi.fn(),
  to: vi.fn(() => ({
    emit: vi.fn(),
  })),
  join: vi.fn(),
  leave: vi.fn(),
  use: vi.fn(),
  close: vi.fn(),
})

export const mockS3Client = () => ({
  upload: vi.fn(() => ({
    promise: vi.fn(),
  })),
  deleteObject: vi.fn(() => ({
    promise: vi.fn(),
  })),
  getSignedUrl: vi.fn(),
})

export const mockEmailTransporter = () => ({
  sendMail: vi.fn(),
  verify: vi.fn(),
})

export const mockQueue = () => ({
  add: vi.fn(),
  process: vi.fn(),
  close: vi.fn(),
  clean: vi.fn(),
  getJobs: vi.fn(),
})

/**
 * Mock data generators
 */
export const generateMockUsers = (count: number = 3) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `user-${index + 1}`,
    email: `user${index + 1}@example.com`,
    name: `User ${index + 1}`,
    phone: `+123456789${index}`,
    avatar: null,
    status: 'online',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
}

export const generateMockMessages = (count: number = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `message-${index + 1}`,
    content: `Test message ${index + 1}`,
    type: 'text',
    senderId: `user-${(index % 2) + 1}`,
    chatId: 'test-chat-id',
    readAt: null,
    createdAt: new Date(Date.now() - (count - index) * 60000), // 1 minute apart
    updatedAt: new Date(Date.now() - (count - index) * 60000),
  }))
}

export const generateMockChats = (count: number = 3) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `chat-${index + 1}`,
    type: index === 0 ? 'group' : 'private',
    name: index === 0 ? `Group Chat ${index + 1}` : null,
    avatar: null,
    lastMessageId: `message-${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
}

/**
 * Test database utilities
 */
export const cleanupDatabase = async (prisma: any) => {
  // Clean up test data in reverse dependency order
  await prisma.message.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.chatParticipant.deleteMany({})
  await prisma.chat.deleteMany({})
  await prisma.user.deleteMany({})
}

export const seedTestData = async (prisma: any) => {
  const users = generateMockUsers(3)
  const chats = generateMockChats(2)
  const messages = generateMockMessages(5)

  // Create users
  for (const user of users) {
    await prisma.user.create({ data: user })
  }

  // Create chats
  for (const chat of chats) {
    await prisma.chat.create({ data: chat })
  }

  // Create messages
  for (const message of messages) {
    await prisma.message.create({ data: message })
  }

  return { users, chats, messages }
}

/**
 * Async test utilities
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
) => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true
    }
    await waitFor(interval)
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Error simulation utilities
 */
export const simulateNetworkError = () => {
  const error = new Error('Network error')
  error.name = 'NetworkError'
  return error
}

export const simulateDatabaseError = () => {
  const error = new Error('Database connection failed')
  error.name = 'DatabaseError'
  return error
}

export const simulateValidationError = (field: string) => {
  const error = new Error(`Validation failed for field: ${field}`)
  error.name = 'ValidationError'
  return error
}

/**
 * File upload test utilities
 */
export const createMockFile = (options: {
  filename?: string
  mimetype?: string
  size?: number
  buffer?: Buffer
} = {}) => ({
  fieldname: 'file',
  originalname: options.filename || 'test.jpg',
  encoding: '7bit',
  mimetype: options.mimetype || 'image/jpeg',
  size: options.size || 1024,
  buffer: options.buffer || Buffer.from('fake file content'),
  destination: '/tmp',
  filename: options.filename || 'test.jpg',
  path: `/tmp/${options.filename || 'test.jpg'}`,
})

/**
 * WebSocket test utilities
 */
export const createMockSocket = () => ({
  id: 'socket-id',
  emit: vi.fn(),
  on: vi.fn(),
  join: vi.fn(),
  leave: vi.fn(),
  disconnect: vi.fn(),
  handshake: {
    auth: {},
    headers: {},
  },
  data: {},
})

export const createMockSocketServer = () => ({
  emit: vi.fn(),
  to: vi.fn(() => ({
    emit: vi.fn(),
  })),
  on: vi.fn(),
  use: vi.fn(),
  close: vi.fn(),
})