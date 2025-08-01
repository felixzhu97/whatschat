import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }

beforeAll(() => {
  // Mock console methods for cleaner test output
  console.log = vi.fn()
  console.info = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole)
})

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks()
})

// Mock external services
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    flushall: vi.fn(),
  })),
}))

vi.mock('socket.io', () => ({
  Server: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
    use: vi.fn(),
    close: vi.fn(),
  })),
}))

vi.mock('nodemailer', () => ({
  createTransporter: vi.fn(() => ({
    sendMail: vi.fn(),
  })),
}))

vi.mock('aws-sdk', () => ({
  S3: vi.fn(() => ({
    upload: vi.fn(() => ({
      promise: vi.fn(),
    })),
    deleteObject: vi.fn(() => ({
      promise: vi.fn(),
    })),
  })),
}))

vi.mock('bull', () => ({
  default: vi.fn(() => ({
    add: vi.fn(),
    process: vi.fn(),
    close: vi.fn(),
  })),
}))

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $on: vi.fn(),
    $transaction: vi.fn(),
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
  })),
}))

// Mock database client module
vi.mock('@/database/client', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $on: vi.fn(),
    $transaction: vi.fn(),
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
  },
}))

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    avatar: null,
    status: 'online',
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockMessage: () => ({
    id: 'test-message-id',
    content: 'Test message',
    type: 'text',
    senderId: 'test-sender-id',
    chatId: 'test-chat-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockChat: () => ({
    id: 'test-chat-id',
    type: 'private',
    name: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}

// Extend global types
declare global {
  var testUtils: {
    createMockUser: () => any
    createMockMessage: () => any
    createMockChat: () => any
  }
}