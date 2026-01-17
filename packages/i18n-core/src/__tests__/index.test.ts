import { describe, it, expect } from 'vitest';
import { createI18n, I18n } from '../index';
import type { II18nConfig } from '../interfaces';

describe('I18n', () => {
  describe('createI18n()', () => {
    it('should create I18n instance', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {
          en: {
            hello: 'Hello',
          },
        },
      };

      // Act
      const i18n = createI18n(config);

      // Assert
      expect(i18n).toBeInstanceOf(I18n);
    });
  });

  describe('I18n class', () => {
    describe('formatMessage()', () => {
      it('should format message without variables', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {
            en: {
              hello: 'Hello World',
            },
          },
        };
        const i18n = createI18n(config);

        // Act
        const result = i18n.formatMessage('hello');

        // Assert
        expect(result).toBe('Hello World');
      });

      it('should format message with variables', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {
            en: {
              greeting: 'Hello {name}',
            },
          },
        };
        const i18n = createI18n(config);

        // Act
        const result = i18n.formatMessage('greeting', { name: 'World' });

        // Assert
        expect(result).toBe('Hello World');
      });

      it('should use default message when message not found', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {},
        };
        const i18n = createI18n(config);

        // Act
        const result = i18n.formatMessage('missing', undefined, 'Default Message');

        // Assert
        expect(result).toBe('Default Message');
      });
    });

    describe('formatDate()', () => {
      it('should format date', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en-US',
          messages: {},
        };
        const i18n = createI18n(config);
        const date = new Date('2024-01-15T10:30:00Z');

        // Act
        const result = i18n.formatDate(date);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('formatNumber()', () => {
      it('should format number', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en-US',
          messages: {},
        };
        const i18n = createI18n(config);

        // Act
        const result = i18n.formatNumber(1234.56);

        // Assert
        expect(result).toBe('1,234.56');
      });
    });

    describe('formatRelativeTime()', () => {
      it('should format relative time', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en-US',
          messages: {},
        };
        const i18n = createI18n(config);

        // Act
        const result = i18n.formatRelativeTime({
          unit: 'day',
          value: -2,
        });

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    describe('getLocale() and setLocale()', () => {
      it('should get and set locale', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {},
        };
        const i18n = createI18n(config);

        // Act & Assert
        expect(i18n.getLocale()).toBe('en');
        i18n.setLocale('zh-CN');
        expect(i18n.getLocale()).toBe('zh-CN');
      });
    });
  });
});
