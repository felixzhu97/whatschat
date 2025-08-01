import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeInput,
  validateFileType,
  validateFileSize,
} from '../../src/utils/validation'

describe('Validation Utils - Simple', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as any)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('MySecurePass1')).toBe(true)
      expect(validatePassword('123456')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('123')).toBe(false)
      expect(validatePassword('short')).toBe(false)
      expect(validatePassword('')).toBe(false)
      expect(validatePassword(null as any)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate phone numbers', () => {
      expect(validatePhone('+1234567890')).toBe(true)
      expect(validatePhone('+86 138 0000 0000')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false) // Missing +
      expect(validatePhone('+123')).toBe(false) // Too short
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null as any)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello World')
      expect(result).toBe('Hello World')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('   Hello World   ')).toBe('Hello World')
    })

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput('   ')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(validateFileType('image/jpeg', allowedTypes)).toBe(true)
      expect(validateFileType('image/png', allowedTypes)).toBe(true)
    })

    it('should reject disallowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(validateFileType('application/pdf', allowedTypes)).toBe(false)
      expect(validateFileType('text/plain', allowedTypes)).toBe(false)
    })

    it('should handle empty inputs', () => {
      const allowedTypes = ['image/jpeg']
      expect(validateFileType('', allowedTypes)).toBe(false)
      expect(validateFileType(null as any, allowedTypes)).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate files within size limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      expect(validateFileSize(500 * 1024, maxSize)).toBe(true) // 500KB
      expect(validateFileSize(1024 * 1024, maxSize)).toBe(true) // Exactly 1MB
      expect(validateFileSize(0, maxSize)).toBe(true) // Empty file
    })

    it('should reject files exceeding size limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      expect(validateFileSize(2 * 1024 * 1024, maxSize)).toBe(false) // 2MB
      expect(validateFileSize(1024 * 1024 + 1, maxSize)).toBe(false) // 1MB + 1 byte
    })

    it('should handle invalid inputs', () => {
      const maxSize = 1024 * 1024
      expect(validateFileSize(-1, maxSize)).toBe(false)
      expect(validateFileSize(null as any, maxSize)).toBe(false)
      expect(validateFileSize(undefined as any, maxSize)).toBe(false)
    })
  })
})