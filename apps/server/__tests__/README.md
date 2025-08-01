# Testing Setup for WhatsChat Server

This directory contains the test suite for the WhatsChat server application built with Node.js, Express, TypeScript, and Prisma.

## Testing Stack

- **Vitest**: Fast and modern testing framework
- **Supertest**: HTTP assertion library for testing Express applications
- **Prisma Mock**: Mocked database operations
- **Node.js Environment**: Server-side testing environment

## Directory Structure

```
__tests__/
├── controllers/           # Tests for Express controllers
├── services/             # Tests for business logic services
├── middleware/           # Tests for Express middleware
├── routes/              # Tests for API routes
├── utils/               # Tests for utility functions
│   ├── validation-simple.test.ts
│   └── test-helpers.ts
├── basic.test.ts        # Basic functionality tests
└── README.md           # This file
```

## Running Tests

### From the server app directory (`apps/server/`):

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### From the root directory:

```bash
# Run all tests across the monorepo
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Test Categories

### 1. Basic Tests (`basic.test.ts`)
- Framework functionality
- Global test utilities
- Async operations

### 2. Validation Tests (`utils/validation-simple.test.ts`)
- Email validation
- Password strength validation
- Phone number validation
- Input sanitization
- File type and size validation

### 3. Service Tests (`services/message-simple.test.ts`)
- Message creation and retrieval
- Pagination and search
- Message updates and deletion
- Database interactions

### 4. Controller Tests (planned)
- Authentication endpoints
- Request/response handling
- Error handling
- Input validation

### 5. Middleware Tests (planned)
- Authentication middleware
- Error handling middleware
- Request validation

### 6. Route Tests (planned)
- API endpoint testing
- Integration testing
- HTTP status codes

## Test Patterns

### Service Testing

Services are tested for:
- **Business Logic**: Core functionality implementation
- **Database Operations**: Prisma client interactions
- **Error Handling**: Proper error throwing and handling
- **Data Validation**: Input validation and sanitization

Example:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MessageService } from '../../src/services/message'

// Mock database client
vi.mock('../../src/database/client', () => ({
  prisma: {
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      // ... other methods
    },
  },
}))

describe('MessageService', () => {
  let messageService: MessageService

  beforeEach(() => {
    vi.clearAllMocks()
    messageService = new MessageService()
  })

  it('should create a message successfully', async () => {
    // Test implementation
  })
})
```

### Controller Testing

Controllers are tested for:
- **HTTP Handling**: Request/response processing
- **Authentication**: Protected route access
- **Validation**: Input validation and error responses
- **Status Codes**: Proper HTTP status code responses

### Middleware Testing

Middleware is tested for:
- **Authentication**: Token validation and user extraction
- **Authorization**: Permission checking
- **Error Handling**: Proper error response formatting
- **Request Processing**: Request modification and validation

## Mock Patterns

### Database Mocking

```typescript
vi.mock('../../src/database/client', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // ... other models
  },
}))
```

### External Service Mocking

```typescript
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    // ... other methods
  })),
}))

vi.mock('nodemailer', () => ({
  createTransporter: vi.fn(() => ({
    sendMail: vi.fn(),
  })),
}))
```

## Test Utilities

The `test-helpers.ts` file provides:

- **Mock Generators**: Create consistent test data
- **Request/Response Mocks**: Express req/res object mocks
- **Database Utilities**: Database seeding and cleanup
- **Async Utilities**: Promise and timing helpers
- **Error Simulation**: Network and database error simulation

## Environment Configuration

### Test Environment Variables (`.env.test`)

```env
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5432/whatschat_test"
JWT_SECRET="test-jwt-secret"
REDIS_URL="redis://localhost:6379/1"
# ... other test-specific variables
```

### Global Test Setup (`vitest.setup.ts`)

- Mock external dependencies
- Set up global test utilities
- Configure test environment
- Mock console methods for cleaner output

## Best Practices

### 1. Test Isolation

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset any global state
})
```

### 2. Descriptive Test Names

```typescript
it('should create a text message successfully', async () => {
  // Test implementation
})

it('should throw error if chat does not exist', async () => {
  // Test implementation
})
```

### 3. Mock External Dependencies

```typescript
// Mock at the module level
vi.mock('../../src/database/client')

// Use mocked functions in tests
const mockPrisma = await import('../../src/database/client')
```

### 4. Test Error Scenarios

```typescript
it('should handle database errors gracefully', async () => {
  mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))
  
  await expect(service.getUser('id')).rejects.toThrow('Database error')
})
```

### 5. Use Proper Assertions

```typescript
// Test return values
expect(result).toEqual(expectedValue)

// Test function calls
expect(mockFunction).toHaveBeenCalledWith(expectedArgs)

// Test error throwing
await expect(asyncFunction()).rejects.toThrow('Expected error')
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployments

## Debugging Tests

### Running Specific Tests

```bash
# Run tests for a specific file
pnpm test validation-simple

# Run tests matching a pattern
pnpm test -t "should create"

# Run tests in a specific directory
pnpm test __tests__/services
```

### Debug Mode

```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run tests in UI mode
pnpm test --ui

# Run with coverage
pnpm test:coverage
```

### Common Issues

1. **Module Mocking**: Use `vi.mock()` at the top level, avoid variables in factory functions
2. **Async Operations**: Use `await` for async operations and `vi.clearAllMocks()` in `beforeEach`
3. **Database Mocking**: Mock the entire Prisma client, not individual methods
4. **Environment Variables**: Use `.env.test` for test-specific configuration
5. **Path Resolution**: Use relative imports or configure path aliases properly

## Contributing

When adding new features or endpoints:

1. Write tests alongside your code
2. Follow existing test patterns
3. Mock external dependencies
4. Test both success and error scenarios
5. Ensure tests pass before submitting PR
6. Aim for meaningful test coverage

For questions about testing patterns or debugging test issues, refer to the [Vitest documentation](https://vitest.dev/guide/) or [Supertest documentation](https://github.com/ladjs/supertest).