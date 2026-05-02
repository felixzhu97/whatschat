import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const originalConsole = { ...console }

beforeAll(() => {
  console.log = vi.fn()
  console.info = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

vi.mock('winston', () => ({
  default: {
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      http: vi.fn(),
      add: vi.fn(),
    })),
    format: {
      combine: vi.fn((...args) => args),
      timestamp: vi.fn(() => vi.fn((info) => info)),
      colorize: vi.fn(() => vi.fn((info) => info)),
      printf: vi.fn(() => vi.fn((info) => info)),
      simple: vi.fn(() => vi.fn((info) => info)),
      json: vi.fn(() => vi.fn((info) => info)),
    },
    transports: {
      Console: vi.fn(),
    },
    addColors: vi.fn(),
  },
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
    add: vi.fn(),
  })),
  format: {
    combine: vi.fn((...args) => args),
    timestamp: vi.fn(() => vi.fn((info) => info)),
    colorize: vi.fn(() => vi.fn((info) => info)),
    printf: vi.fn(() => vi.fn((info) => info)),
    simple: vi.fn(() => vi.fn((info) => info)),
    json: vi.fn(() => vi.fn((info) => info)),
  },
  transports: {
    Console: vi.fn(),
  },
  addColors: vi.fn(),
}))

vi.mock('winston-daily-rotate-file', () => ({
  default: vi.fn(),
}))

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    exists: vi.fn().mockResolvedValue(0),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(-1),
    sadd: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    srem: vi.fn().mockResolvedValue(1),
    rpush: vi.fn().mockResolvedValue(1),
    lpush: vi.fn().mockResolvedValue(1),
    lrange: vi.fn().mockResolvedValue([]),
    ltrim: vi.fn().mockResolvedValue('OK'),
    on: vi.fn(),
  })),
}))

vi.mock('redis', () => ({
  default: {
    createClient: vi.fn(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      exists: vi.fn().mockResolvedValue(0),
      expire: vi.fn().mockResolvedValue(1),
      flushall: vi.fn().mockResolvedValue('OK'),
      quit: vi.fn().mockResolvedValue('OK'),
      sadd: vi.fn().mockResolvedValue(1),
      smembers: vi.fn().mockResolvedValue([]),
      srem: vi.fn().mockResolvedValue(1),
      rpush: vi.fn().mockResolvedValue(1),
      lpush: vi.fn().mockResolvedValue(1),
      lrange: vi.fn().mockResolvedValue([]),
      ltrim: vi.fn().mockResolvedValue('OK'),
      setex: vi.fn().mockResolvedValue('OK'),
      on: vi.fn(),
    })),
  },
}))

vi.mock('cassandra-driver', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  })),
}))

vi.mock('mongodb', () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    db: vi.fn().mockReturnValue({
      collection: vi.fn().mockReturnValue({
        createIndex: vi.fn().mockResolvedValue('index_created'),
      }),
    }),
  })),
}))

vi.mock('@elastic/elasticsearch', () => ({
  Client: vi.fn().mockImplementation(() => ({
    ping: vi.fn().mockResolvedValue(true),
    indices: {
      exists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({}),
      putMapping: vi.fn().mockResolvedValue({}),
    },
    index: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
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

vi.mock('bull', () => ({
  default: vi.fn(() => ({
    add: vi.fn(),
    process: vi.fn(),
    close: vi.fn(),
  })),
}))

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $on: vi.fn(),
    $transaction: vi.fn().mockImplementation((cb) => cb(mockPrisma)),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    userSettings: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
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
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    status: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    call: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    group: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    groupMember: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    chatParticipant: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
  }
  return {
    PrismaClient: vi.fn(() => mockPrisma),
    default: { PrismaClient: vi.fn(() => mockPrisma) },
  }
})

vi.mock('@/database/client', () => {
  const mockPrisma = {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $on: vi.fn(),
    $transaction: vi.fn().mockImplementation((cb) => cb(mockPrisma)),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    userSettings: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
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
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    status: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    call: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    group: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    groupMember: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    chatParticipant: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
  }
  return {
    prisma: mockPrisma,
    default: mockPrisma,
  }
})

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

declare global {
  var testUtils: {
    createMockUser: () => any
    createMockMessage: () => any
    createMockChat: () => any
  }
}
