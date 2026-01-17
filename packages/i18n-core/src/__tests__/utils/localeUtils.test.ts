import { describe, it, expect } from 'vitest';
import {
  isValidLocale,
  normalizeLocale,
  parseLocale,
  getParentLocale,
  detectBrowserLocales,
  matchLocale,
} from '../../utils/localeUtils';

describe('localeUtils', () => {
  describe('isValidLocale()', () => {
    describe('when locale is valid', () => {
      it('should return true for simple language codes', () => {
        // Arrange & Act & Assert
        expect(isValidLocale('en')).toBe(true);
        expect(isValidLocale('zh')).toBe(true);
        expect(isValidLocale('fr')).toBe(true);
      });

      it('should return true for language-region codes', () => {
        // Arrange & Act & Assert
        expect(isValidLocale('en-US')).toBe(true);
        expect(isValidLocale('zh-CN')).toBe(true);
        expect(isValidLocale('fr-CA')).toBe(true);
      });

      it('should return true for language-region-script codes', () => {
        // Arrange & Act & Assert
        expect(isValidLocale('zh-Hans-CN')).toBe(true);
        expect(isValidLocale('zh-Hant-TW')).toBe(true);
      });
    });

    describe('when locale is invalid', () => {
      it('should return false for empty string', () => {
        // Arrange & Act & Assert
        expect(isValidLocale('')).toBe(false);
      });

      it('should return false for null or undefined', () => {
        // Arrange & Act & Assert
        expect(isValidLocale(null as any)).toBe(false);
        expect(isValidLocale(undefined as any)).toBe(false);
      });

      it('should return false for invalid format', () => {
        // Arrange & Act & Assert
        expect(isValidLocale('invalid-locale-format-12345')).toBe(false);
        expect(isValidLocale('123')).toBe(false);
      });
    });
  });

  describe('normalizeLocale()', () => {
    describe('when normalizing locale strings', () => {
      it('should convert to lowercase for language code', () => {
        // Arrange & Act & Assert
        expect(normalizeLocale('EN')).toBe('en');
        expect(normalizeLocale('Zh')).toBe('zh');
      });

      it('should keep region code uppercase', () => {
        // Arrange & Act & Assert
        expect(normalizeLocale('en-us')).toBe('en-US');
        expect(normalizeLocale('zh-cn')).toBe('zh-CN');
      });

      it('should handle empty string by returning default', () => {
        // Arrange & Act & Assert
        expect(normalizeLocale('')).toBe('en');
      });

      it('should normalize existing locale codes', () => {
        // Arrange & Act & Assert
        expect(normalizeLocale('en-US')).toBe('en-US');
        expect(normalizeLocale('zh-CN')).toBe('zh-CN');
      });
    });
  });

  describe('parseLocale()', () => {
    describe('when parsing locale strings', () => {
      it('should parse simple language code', () => {
        // Arrange & Act
        const result = parseLocale('en');

        // Assert
        expect(result.code).toBe('en');
        expect(result.language).toBe('en');
        expect(result.region).toBeUndefined();
        expect(result.script).toBeUndefined();
      });

      it('should parse language-region code', () => {
        // Arrange & Act
        const result = parseLocale('en-US');

        // Assert
        expect(result.code).toBe('en-US');
        expect(result.language).toBe('en');
        expect(result.region).toBe('US');
        expect(result.script).toBeUndefined();
      });

      it('should parse language-script-region code', () => {
        // Arrange & Act
        const result = parseLocale('zh-Hans-CN');

        // Assert
        expect(result.code).toBe('zh-Hans-CN');
        expect(result.language).toBe('zh');
        expect(result.script).toBe('Hans');
        expect(result.region).toBe('CN');
      });
    });
  });

  describe('getParentLocale()', () => {
    describe('when locale has parent', () => {
      it('should return parent locale for language-region', () => {
        // Arrange & Act & Assert
        expect(getParentLocale('en-US')).toBe('en');
        expect(getParentLocale('zh-CN')).toBe('zh');
      });

      it('should return null for simple language code', () => {
        // Arrange & Act & Assert
        expect(getParentLocale('en')).toBeNull();
        expect(getParentLocale('zh')).toBeNull();
      });
    });
  });

  describe('detectBrowserLocales()', () => {
    describe('when called in non-browser environment', () => {
      it('should return default locale array', () => {
        // Arrange & Act
        const result = detectBrowserLocales();

        // Assert
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0]).toBe('en');
      });
    });
  });

  describe('matchLocale()', () => {
    describe('when exact match exists', () => {
      it('should return exact match', () => {
        // Arrange
        const requested = 'en-US';
        const available = ['en', 'en-US', 'zh-CN'];

        // Act
        const result = matchLocale(requested, available);

        // Assert
        expect(result).toBe('en-US');
      });
    });

    describe('when parent locale match exists', () => {
      it('should return parent locale', () => {
        // Arrange
        const requested = 'en-US';
        const available = ['en', 'zh-CN'];

        // Act
        const result = matchLocale(requested, available);

        // Assert
        expect(result).toBe('en');
      });
    });

    describe('when fuzzy match exists', () => {
      it('should return locale with same language', () => {
        // Arrange
        const requested = 'en-US';
        const available = ['en-GB', 'zh-CN'];

        // Act
        const result = matchLocale(requested, available);

        // Assert
        expect(result).toBe('en-GB');
      });
    });

    describe('when no match exists', () => {
      it('should return null', () => {
        // Arrange
        const requested = 'fr-FR';
        const available = ['en', 'zh-CN'];

        // Act
        const result = matchLocale(requested, available);

        // Assert
        expect(result).toBeNull();
      });
    });
  });
});
