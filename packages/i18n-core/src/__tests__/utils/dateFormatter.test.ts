import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime } from '../../utils/dateFormatter';
import type { DateTimeFormatOptions, RelativeTimeFormatOptions } from '../../types';

describe('dateFormatter', () => {
  describe('formatDate()', () => {
    describe('when formatting dates', () => {
      it('should format Date object', () => {
        // Arrange
        const date = new Date('2024-01-15T10:30:00Z');

        // Act
        const result = formatDate('en-US', date);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should format timestamp', () => {
        // Arrange
        const timestamp = new Date('2024-01-15T10:30:00Z').getTime();

        // Act
        const result = formatDate('en-US', timestamp);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should format date string', () => {
        // Arrange
        const dateString = '2024-01-15T10:30:00Z';

        // Act
        const result = formatDate('en-US', dateString);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should use preset format', () => {
        // Arrange
        const date = new Date('2024-01-15T10:30:00Z');
        const options: DateTimeFormatOptions = {
          format: 'short',
        };

        // Act
        const result = formatDate('en-US', date, options);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should use custom format options', () => {
        // Arrange
        const date = new Date('2024-01-15T10:30:00Z');
        const options: DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };

        // Act
        const result = formatDate('en-US', date, options);

        // Assert
        expect(result).toBeDefined();
        expect(result).toContain('January');
        expect(result).toContain('2024');
      });
    });

    describe('when handling invalid dates', () => {
      it('should throw error for invalid date', () => {
        // Arrange
        const invalidDate = new Date('invalid');

        // Act & Assert
        expect(() => {
          formatDate('en-US', invalidDate);
        }).toThrow();
      });
    });
  });

  describe('formatRelativeTime()', () => {
    describe('when formatting relative time', () => {
      it('should format days', () => {
        // Arrange
        const options: RelativeTimeFormatOptions = {
          unit: 'day',
          value: -2,
        };

        // Act
        const result = formatRelativeTime('en-US', options);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('2');
      });

      it('should format hours', () => {
        // Arrange
        const options: RelativeTimeFormatOptions = {
          unit: 'hour',
          value: 5,
        };

        // Act
        const result = formatRelativeTime('en-US', options);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should format with numeric auto option', () => {
        // Arrange
        const options: RelativeTimeFormatOptions = {
          unit: 'day',
          value: 1,
          numeric: 'auto',
        };

        // Act
        const result = formatRelativeTime('en-US', options);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });
});
