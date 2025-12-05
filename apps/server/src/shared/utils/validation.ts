/**
 * Validation utilities for server-side validation
 */

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false
  }

  return password.trim().length >= 6
}

export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Remove spaces and check format: +[country code][number]
  const cleanPhone = phone.replace(/\s/g, '')
  const phoneRegex = /^\+[1-9]\d{6,14}$/
  return phoneRegex.test(cleanPhone)
}

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags (including script tags) and trim whitespace
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export const validateFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  if (!mimeType || typeof mimeType !== 'string') {
    return false
  }

  return allowedTypes.includes(mimeType)
}

export const validateFileSize = (size: number, maxSize: number): boolean => {
  if (typeof size !== 'number' || size < 0) {
    return false
  }

  return size <= maxSize
}