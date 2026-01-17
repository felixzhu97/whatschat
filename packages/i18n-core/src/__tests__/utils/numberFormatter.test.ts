import { describe, it, expect } from 'vitest';
import { formatNumber, formatCurrency, formatPercent } from '../../utils/numberFormatter';
import type { NumberFormatOptions } from '../../types';

describe('numberFormatter', () => {
  describe('formatNumber()', () => {
    describe('when formatting numbers', () => {
      it('should format integer', () => {
        // Arrange
        const value = 1234;

        // Act
        const result = formatNumber('en-US', value);

        // Assert
        expect(result).toBe('1,234');
      });

      it('should format decimal number', () => {
        // Arrange
        const value = 1234.56;

        // Act
        const result = formatNumber('en-US', value);

        // Assert
        expect(result).toBe('1,234.56');
      });

      it('should format with custom locale', () => {
        // Arrange
        const value = 1234.56;

        // Act
        const result = formatNumber('de-DE', value);

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should format with custom options', () => {
        // Arrange
        const value = 1234.567;
        const options: NumberFormatOptions = {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        };

        // Act
        const result = formatNumber('en-US', value, options);

        // Assert
        expect(result).toBe('1,234.57');
      });
    });

    describe('when handling invalid numbers', () => {
      it('should throw error for NaN', () => {
        // Arrange & Act & Assert
        expect(() => {
          formatNumber('en-US', NaN);
        }).toThrow();
      });
    });
  });

  describe('formatCurrency()', () => {
    describe('when formatting currency', () => {
      it('should format USD currency', () => {
        // Arrange
        const value = 1234.56;

        // Act
        const result = formatCurrency('en-US', value, 'USD');

        // Assert
        expect(result).toBe('$1,234.56');
      });

      it('should format EUR currency', () => {
        // Arrange
        const value = 1234.56;

        // Act
        const result = formatCurrency('de-DE', value, 'EUR');

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('1.234');
      });

      it('should format with custom options', () => {
        // Arrange
        const value = 1234.56;

        // Act
        const result = formatCurrency('en-US', value, 'USD', {
          minimumFractionDigits: 0,
        });

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('formatPercent()', () => {
    describe('when formatting percentages', () => {
      it('should format decimal as percentage', () => {
        // Arrange
        const value = 0.1234;

        // Act
        const result = formatPercent('en-US', value);

        // Assert
        expect(result).toBe('12%');
      });

      it('should format integer as percentage', () => {
        // Arrange
        const value = 1;

        // Act
        const result = formatPercent('en-US', value);

        // Assert
        expect(result).toBe('100%');
      });

      it('should format with custom options', () => {
        // Arrange
        const value = 0.1234;

        // Act
        const result = formatPercent('en-US', value, {
          minimumFractionDigits: 2,
        });

        // Assert
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('%');
      });
    });
  });
});
