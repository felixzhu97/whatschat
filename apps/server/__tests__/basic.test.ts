import { describe, it, expect } from 'vitest'

describe('Basic Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should work with global test utils', () => {
    const mockUser = global.testUtils.createMockUser()
    expect(mockUser).toHaveProperty('id')
    expect(mockUser).toHaveProperty('email')
    expect(mockUser).toHaveProperty('name')
  })
})