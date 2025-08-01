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
      expect(validateEmail('a@b.co')).toBe(true) // Minimal valid email
      expect(validateEmail('user123@test-domain.com')).toBe(true)
      expect(validateEmail('user_name@example.com')).toBe(true)
      expect(validateEmail('test.email.with+symbol@example.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false) // Missing TLD
      expect(validateEmail('user@.com')).toBe(false) // Missing domain
      expect(validateEmail('user..name@example.com')).toBe(false) // Double dots
      expect(validateEmail('user name@example.com')).toBe(false) // Space in local part
      expect(validateEmail('user@exam ple.com')).toBe(false) // Space in domain
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as any)).toBe(false)
      expect(validateEmail(undefined as any)).toBe(false)
    })

    it('should handle emails with whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true) // Should trim
      expect(validateEmail('\tuser@domain.com\n')).toBe(true) // Should trim tabs/newlines
    })

    it('should handle non-string inputs', () => {
      expect(validateEmail(123 as any)).toBe(false)
      expect(validateEmail({} as any)).toBe(false)
      expect(validateEmail([] as any)).toBe(false)
      expect(validateEmail(true as any)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate passwords with minimum length', () => {
      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('MySecurePass1')).toBe(true)
      expect(validatePassword('123456')).toBe(true) // Exactly 6 characters
      expect(validatePassword('abcdef')).toBe(true) // Exactly 6 characters
      expect(validatePassword('a very long password with spaces')).toBe(true)
    })

    it('should reject passwords below minimum length', () => {
      expect(validatePassword('123')).toBe(false)
      expect(validatePassword('short')).toBe(false) // 5 characters
      expect(validatePassword('12345')).toBe(false) // 5 characters
      expect(validatePassword('')).toBe(false)
      expect(validatePassword(null as any)).toBe(false)
      expect(validatePassword(undefined as any)).toBe(false)
    })

    it('should handle passwords with whitespace', () => {
      expect(validatePassword('  123456  ')).toBe(true) // Should trim to 6 chars
      expect(validatePassword('   12345   ')).toBe(false) // Should trim to 5 chars
      expect(validatePassword('      ')).toBe(false) // Only whitespace
    })

    it('should handle non-string inputs', () => {
      expect(validatePassword(123456 as any)).toBe(false)
      expect(validatePassword({} as any)).toBe(false)
      expect(validatePassword([] as any)).toBe(false)
      expect(validatePassword(true as any)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone number formats', () => {
      expect(validatePhone('+1234567890')).toBe(true)
      expect(validatePhone('+86 138 0000 0000')).toBe(true) // With spaces
      expect(validatePhone('+44 20 7946 0958')).toBe(true) // UK format
      expect(validatePhone('+1 555 123 4567')).toBe(true) // US format
      expect(validatePhone('+8613800000000')).toBe(true) // No spaces
      expect(validatePhone('+49 30 12345678')).toBe(true) // German format
    })

    it('should reject invalid phone number formats', () => {
      expect(validatePhone('1234567890')).toBe(false) // Missing +
      expect(validatePhone('+123')).toBe(false) // Too short (< 7 digits)
      expect(validatePhone('+0123456789')).toBe(false) // Country code starts with 0
      expect(validatePhone('+123456789012345678')).toBe(false) // Too long (> 15 digits)
      expect(validatePhone('+abc1234567890')).toBe(false) // Contains letters
      expect(validatePhone('+ 1234567890')).toBe(false) // Space after +
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null as any)).toBe(false)
      expect(validatePhone(undefined as any)).toBe(false)
    })

    it('should handle edge cases for phone validation', () => {
      expect(validatePhone('+1234567')).toBe(true) // Minimum length (7 digits)
      expect(validatePhone('+123456789012345')).toBe(true) // Maximum length (15 digits)
      expect(validatePhone('+123456')).toBe(false) // Below minimum (6 digits)
      expect(validatePhone('+1234567890123456')).toBe(false) // Above maximum (16 digits)
    })

    it('should handle non-string inputs', () => {
      expect(validatePhone(1234567890 as any)).toBe(false)
      expect(validatePhone({} as any)).toBe(false)
      expect(validatePhone([] as any)).toBe(false)
      expect(validatePhone(true as any)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove script tags and content', () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello World')
      expect(result).toBe('Hello World')
      
      const complexScript = sanitizeInput('<script type="text/javascript">malicious code</script>Safe content')
      expect(complexScript).toBe('Safe content')
      
      const multilineScript = sanitizeInput(`<script>
        var x = 1;
        alert('xss');
      </script>Clean text`)
      expect(multilineScript).toBe('Clean text')
    })

    it('should remove various HTML tags', () => {
      expect(sanitizeInput('<div>Hello</div>')).toBe('Hello')
      expect(sanitizeInput('<p>Paragraph</p>')).toBe('Paragraph')
      expect(sanitizeInput('<a href="http://evil.com">Link</a>')).toBe('Link')
      expect(sanitizeInput('<img src="image.jpg" alt="test">')).toBe('')
      expect(sanitizeInput('<span class="highlight">Text</span>')).toBe('Text')
    })

    it('should handle nested and complex HTML', () => {
      const complex = '<div><p>Hello <strong>World</strong></p><script>alert("xss")</script></div>'
      expect(sanitizeInput(complex)).toBe('Hello World')
      
      const nested = '<div><span><em>Nested <b>content</b></em></span></div>'
      expect(sanitizeInput(nested)).toBe('Nested content')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('   Hello World   ')).toBe('Hello World')
      expect(sanitizeInput('\t\nHello\t\n')).toBe('Hello')
      expect(sanitizeInput('  <p>  Text  </p>  ')).toBe('Text')
    })

    it('should handle empty and whitespace-only inputs', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput('   ')).toBe('')
      expect(sanitizeInput('\t\n\r')).toBe('')
      expect(sanitizeInput('<div>   </div>')).toBe('')
    })

    it('should handle null, undefined, and non-string inputs', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
      expect(sanitizeInput(123 as any)).toBe('')
      expect(sanitizeInput({} as any)).toBe('')
      expect(sanitizeInput([] as any)).toBe('')
      expect(sanitizeInput(true as any)).toBe('')
    })

    it('should preserve safe text content', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
      expect(sanitizeInput('Numbers 123 and symbols !@#')).toBe('Numbers 123 and symbols !@#')
      expect(sanitizeInput('Unicode: 你好世界 🌍')).toBe('Unicode: 你好世界 🌍')
    })

    it('should handle malformed HTML', () => {
      expect(sanitizeInput('<div>Unclosed tag')).toBe('Unclosed tag')
      expect(sanitizeInput('Text with < and > symbols')).toBe('Text with  symbols')
      expect(sanitizeInput('<>')).toBe('')
    })
  })

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      expect(validateFileType('image/jpeg', allowedTypes)).toBe(true)
      expect(validateFileType('image/png', allowedTypes)).toBe(true)
      expect(validateFileType('application/pdf', allowedTypes)).toBe(true)
    })

    it('should reject disallowed file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(validateFileType('application/pdf', allowedTypes)).toBe(false)
      expect(validateFileType('text/plain', allowedTypes)).toBe(false)
      expect(validateFileType('video/mp4', allowedTypes)).toBe(false)
      expect(validateFileType('audio/mpeg', allowedTypes)).toBe(false)
    })

    it('should be case sensitive', () => {
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(validateFileType('IMAGE/JPEG', allowedTypes)).toBe(false)
      expect(validateFileType('Image/Png', allowedTypes)).toBe(false)
    })

    it('should handle empty and invalid inputs', () => {
      const allowedTypes = ['image/jpeg']
      expect(validateFileType('', allowedTypes)).toBe(false)
      expect(validateFileType(null as any, allowedTypes)).toBe(false)
      expect(validateFileType(undefined as any, allowedTypes)).toBe(false)
    })

    it('should handle non-string mime types', () => {
      const allowedTypes = ['image/jpeg']
      expect(validateFileType(123 as any, allowedTypes)).toBe(false)
      expect(validateFileType({} as any, allowedTypes)).toBe(false)
      expect(validateFileType([] as any, allowedTypes)).toBe(false)
      expect(validateFileType(true as any, allowedTypes)).toBe(false)
    })

    it('should handle empty allowed types array', () => {
      expect(validateFileType('image/jpeg', [])).toBe(false)
      expect(validateFileType('text/plain', [])).toBe(false)
    })

    it('should handle common file types', () => {
      const documentTypes = ['application/pdf', 'application/msword', 'text/plain']
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      const videoTypes = ['video/mp4', 'video/avi', 'video/quicktime']
      
      expect(validateFileType('application/pdf', documentTypes)).toBe(true)
      expect(validateFileType('image/gif', imageTypes)).toBe(true)
      expect(validateFileType('video/mp4', videoTypes)).toBe(true)
      
      expect(validateFileType('image/jpeg', documentTypes)).toBe(false)
      expect(validateFileType('video/mp4', imageTypes)).toBe(false)
      expect(validateFileType('application/pdf', videoTypes)).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('should validate files within size limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      expect(validateFileSize(500 * 1024, maxSize)).toBe(true) // 500KB
      expect(validateFileSize(1024 * 1024, maxSize)).toBe(true) // Exactly 1MB
      expect(validateFileSize(0, maxSize)).toBe(true) // Empty file
      expect(validateFileSize(1, maxSize)).toBe(true) // 1 byte
    })

    it('should reject files exceeding size limit', () => {
      const maxSize = 1024 * 1024 // 1MB
      expect(validateFileSize(2 * 1024 * 1024, maxSize)).toBe(false) // 2MB
      expect(validateFileSize(1024 * 1024 + 1, maxSize)).toBe(false) // 1MB + 1 byte
      expect(validateFileSize(10 * 1024 * 1024, maxSize)).toBe(false) // 10MB
    })

    it('should handle boundary conditions', () => {
      const maxSize = 1000
      expect(validateFileSize(999, maxSize)).toBe(true) // Just under limit
      expect(validateFileSize(1000, maxSize)).toBe(true) // Exactly at limit
      expect(validateFileSize(1001, maxSize)).toBe(false) // Just over limit
    })

    it('should handle invalid size inputs', () => {
      const maxSize = 1024 * 1024
      expect(validateFileSize(-1, maxSize)).toBe(false) // Negative size
      expect(validateFileSize(-100, maxSize)).toBe(false) // Large negative
      expect(validateFileSize(null as any, maxSize)).toBe(false)
      expect(validateFileSize(undefined as any, maxSize)).toBe(false)
    })

    it('should handle non-number size inputs', () => {
      const maxSize = 1024 * 1024
      expect(validateFileSize('1000' as any, maxSize)).toBe(false)
      expect(validateFileSize({} as any, maxSize)).toBe(false)
      expect(validateFileSize([] as any, maxSize)).toBe(false)
      expect(validateFileSize(true as any, maxSize)).toBe(false)
      expect(validateFileSize(NaN, maxSize)).toBe(false)
      expect(validateFileSize(Infinity, maxSize)).toBe(false)
    })

    it('should handle different max size values', () => {
      expect(validateFileSize(100, 0)).toBe(false) // Max size is 0
      expect(validateFileSize(0, 0)).toBe(true) // Both are 0
      expect(validateFileSize(1000, 500)).toBe(false) // Size > max
      expect(validateFileSize(500, 1000)).toBe(true) // Size < max
    })

    it('should handle large file sizes', () => {
      const maxSize = 100 * 1024 * 1024 * 1024 // 100GB
      const largeSize = 50 * 1024 * 1024 * 1024 // 50GB
      expect(validateFileSize(largeSize, maxSize)).toBe(true)
      
      const tooLarge = 150 * 1024 * 1024 * 1024 // 150GB
      expect(validateFileSize(tooLarge, maxSize)).toBe(false)
    })
  })
})