import { describe, it, expect, beforeEach } from 'vitest';
import { I18nStore, createI18nStore } from '../../store/i18nStore';
import type { II18nConfig, IMessageLoader } from '../../interfaces';

describe('I18nStore', () => {
  describe('when creating store', () => {
    it('should create store with default config', () => {
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
      const store = createI18nStore(config);

      // Assert
      expect(store).toBeInstanceOf(I18nStore);
      expect(store.getLocale()).toBe('en');
    });

    it('should set fallback locale', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        fallbackLocale: 'zh',
        messages: {
          en: { hello: 'Hello' },
          zh: { hello: '你好' },
        },
      };

      // Act
      const store = createI18nStore(config);

      // Assert
      expect(store.getFallbackLocale()).toBe('zh');
    });
  });

  describe('getLocale()', () => {
    it('should return current locale', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'zh-CN',
        messages: {},
      };
      const store = createI18nStore(config);

      // Act
      const result = store.getLocale();

      // Assert
      expect(result).toBe('zh-CN');
    });
  });

  describe('setLocale()', () => {
    it('should update current locale', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {},
      };
      const store = createI18nStore(config);

      // Act
      store.setLocale('zh-CN');
      const result = store.getLocale();

      // Assert
      expect(result).toBe('zh-CN');
    });

    it('should normalize locale', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {},
      };
      const store = createI18nStore(config);

      // Act
      store.setLocale('zh-cn');
      const result = store.getLocale();

      // Assert
      expect(result).toBe('zh-CN');
    });
  });

  describe('getMessages()', () => {
    describe('when messages exist', () => {
      it('should return messages for current locale', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {
            en: {
              hello: 'Hello',
              goodbye: 'Goodbye',
            },
          },
        };
        const store = createI18nStore(config);

        // Act
        const result = store.getMessages();

        // Assert
        expect(result).toEqual({
          hello: 'Hello',
          goodbye: 'Goodbye',
        });
      });

      it('should return messages for specified locale', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {
            en: { hello: 'Hello' },
            zh: { hello: '你好' },
          },
        };
        const store = createI18nStore(config);

        // Act
        const result = store.getMessages('zh');

        // Assert
        expect(result).toEqual({ hello: '你好' });
      });

      it('should return fallback messages when locale not found', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          fallbackLocale: 'en',
          messages: {
            en: { hello: 'Hello' },
          },
        };
        const store = createI18nStore(config);

        // Act
        store.setLocale('fr');
        const result = store.getMessages();

        // Assert
        expect(result).toEqual({ hello: 'Hello' });
      });
    });

    describe('when messages do not exist', () => {
      it('should return empty object', () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'fr',
          messages: {},
        };
        const store = createI18nStore(config);

        // Act
        const result = store.getMessages();

        // Assert
        expect(result).toEqual({});
      });
    });
  });

  describe('setMessages()', () => {
    it('should set messages for locale', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {},
      };
      const store = createI18nStore(config);

      // Act
      store.setMessages('fr', { hello: 'Bonjour' });
      const result = store.getMessages('fr');

      // Assert
      expect(result).toEqual({ hello: 'Bonjour' });
    });
  });

  describe('loadMessages()', () => {
    describe('when message loader is provided', () => {
      it('should load messages successfully', async () => {
        // Arrange
        const mockLoader: IMessageLoader = {
          load: async (locale: string) => {
            if (locale === 'fr') {
              return { hello: 'Bonjour' };
            }
            throw new Error('Locale not found');
          },
          has: async (locale: string) => locale === 'fr',
        };
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {},
          messageLoader: mockLoader,
        };
        const store = createI18nStore(config);

        // Act
        const result = await store.loadMessages('fr');
        const messages = store.getMessages('fr');

        // Assert
        expect(result).toBe(true);
        expect(messages).toEqual({ hello: 'Bonjour' });
      });

      it('should return false when loader fails', async () => {
        // Arrange
        const mockLoader: IMessageLoader = {
          load: async () => {
            throw new Error('Load failed');
          },
          has: async () => false,
        };
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {},
          messageLoader: mockLoader,
        };
        const store = createI18nStore(config);

        // Act
        const result = await store.loadMessages('fr');

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when message loader is not provided', () => {
      it('should return false', async () => {
        // Arrange
        const config: II18nConfig = {
          defaultLocale: 'en',
          messages: {},
        };
        const store = createI18nStore(config);

        // Act
        const result = await store.loadMessages('fr');

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe('hasMessages()', () => {
    it('should return true when messages exist', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {
          en: { hello: 'Hello' },
        },
      };
      const store = createI18nStore(config);

      // Act & Assert
      expect(store.hasMessages('en')).toBe(true);
    });

    it('should return false when messages do not exist', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {},
      };
      const store = createI18nStore(config);

      // Act & Assert
      expect(store.hasMessages('fr')).toBe(false);
    });
  });

  describe('getLoadedLocales()', () => {
    it('should return all loaded locales', () => {
      // Arrange
      const config: II18nConfig = {
        defaultLocale: 'en',
        messages: {
          en: { hello: 'Hello' },
          zh: { hello: '你好' },
          fr: { hello: 'Bonjour' },
        },
      };
      const store = createI18nStore(config);

      // Act
      const result = store.getLoadedLocales();

      // Assert
      expect(result).toContain('en');
      expect(result).toContain('zh');
      expect(result).toContain('fr');
    });
  });
});
