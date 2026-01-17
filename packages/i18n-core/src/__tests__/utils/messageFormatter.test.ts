import { describe, it, expect } from 'vitest';
import { getNestedMessage, formatMessage } from '../../utils/messageFormatter';
import type { MessageDescriptor, NestedMessages } from '../../types';

describe('messageFormatter', () => {
  describe('getNestedMessage()', () => {
    describe('when message exists', () => {
      it('should get simple message', () => {
        // Arrange
        const messages: NestedMessages = {
          hello: 'Hello',
          goodbye: 'Goodbye',
        };

        // Act
        const result = getNestedMessage(messages, 'hello');

        // Assert
        expect(result).toBe('Hello');
      });

      it('should get nested message', () => {
        // Arrange
        const messages: NestedMessages = {
          common: {
            hello: 'Hello',
            goodbye: 'Goodbye',
          },
        };

        // Act
        const result = getNestedMessage(messages, 'common.hello');

        // Assert
        expect(result).toBe('Hello');
      });

      it('should get deeply nested message', () => {
        // Arrange
        const messages: NestedMessages = {
          app: {
            pages: {
              home: {
                title: 'Home Page',
              },
            },
          },
        };

        // Act
        const result = getNestedMessage(messages, 'app.pages.home.title');

        // Assert
        expect(result).toBe('Home Page');
      });
    });

    describe('when message does not exist', () => {
      it('should return null for missing message', () => {
        // Arrange
        const messages: NestedMessages = {
          hello: 'Hello',
        };

        // Act
        const result = getNestedMessage(messages, 'goodbye');

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for invalid path', () => {
        // Arrange
        const messages: NestedMessages = {
          common: {
            hello: 'Hello',
          },
        };

        // Act
        const result = getNestedMessage(messages, 'common.hello.invalid');

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for empty messages', () => {
        // Arrange & Act
        const result = getNestedMessage({}, 'hello');

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('formatMessage()', () => {
    describe('when formatting simple messages', () => {
      it('should return message without variables', () => {
        // Arrange
        const messages: NestedMessages = {
          hello: 'Hello World',
        };

        // Act
        const result = formatMessage('en', messages, 'hello');

        // Assert
        expect(result).toBe('Hello World');
      });

      it('should use default message when message not found', () => {
        // Arrange
        const messages: NestedMessages = {};

        // Act
        const result = formatMessage('en', messages, 'missing', undefined, 'Default Message');

        // Assert
        expect(result).toBe('Default Message');
      });
    });

    describe('when formatting messages with variables', () => {
      it('should replace single variable', () => {
        // Arrange
        const messages: NestedMessages = {
          hello: 'Hello {name}',
        };

        // Act
        const result = formatMessage('en', messages, 'hello', { name: 'World' });

        // Assert
        expect(result).toBe('Hello World');
      });

      it('should replace multiple variables', () => {
        // Arrange
        const messages: NestedMessages = {
          greeting: 'Hello {name}, you have {count} messages',
        };

        // Act
        const result = formatMessage('en', messages, 'greeting', {
          name: 'Alice',
          count: 5,
        });

        // Assert
        expect(result).toBe('Hello Alice, you have 5 messages');
      });

      it('should handle variables with spaces', () => {
        // Arrange
        const messages: NestedMessages = {
          greeting: 'Hello { name }',
        };

        // Act
        const result = formatMessage('en', messages, 'greeting', { name: 'World' });

        // Assert
        expect(result).toBe('Hello World');
      });
    });

    describe('when using MessageDescriptor', () => {
      it('should use descriptor id and defaultMessage', () => {
        // Arrange
        const messages: NestedMessages = {};
        const descriptor: MessageDescriptor = {
          id: 'missing',
          defaultMessage: 'Default Message',
        };

        // Act
        const result = formatMessage('en', messages, descriptor);

        // Assert
        expect(result).toBe('Default Message');
      });

      it('should prioritize message over defaultMessage', () => {
        // Arrange
        const messages: NestedMessages = {
          hello: 'Hello World',
        };
        const descriptor: MessageDescriptor = {
          id: 'hello',
          defaultMessage: 'Default Message',
        };

        // Act
        const result = formatMessage('en', messages, descriptor);

        // Assert
        expect(result).toBe('Hello World');
      });
    });
  });
});
