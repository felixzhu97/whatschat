import { describe, it, expect } from 'vitest';
import {
  expectArrayToContainEqual,
  expectObjectToContain,
  expectToBeInRange,
} from '../../assertions/matchers';

describe('Assertions', () => {
  describe('expectArrayToContainEqual()', () => {
    describe('when checking array contains equal item', () => {
      it('should pass when array contains equal item', () => {
        // Arrange (Given)
        const array = [
          { id: 1, name: 'test' },
          { id: 2, name: 'other' },
        ];
        const expectedItem = { id: 1, name: 'test' };

        // Act (When) & Assert (Then)
        expect(() => {
          expectArrayToContainEqual(array, expectedItem);
        }).not.toThrow();
      });

      it('should throw when array does not contain item', () => {
        // Arrange (Given)
        const array = [
          { id: 1, name: 'test' },
          { id: 2, name: 'other' },
        ];
        const expectedItem = { id: 3, name: 'missing' };

        // Act (When) & Assert (Then)
        expect(() => {
          expectArrayToContainEqual(array, expectedItem);
        }).toThrow();
      });

      it('should work with primitive values', () => {
        // Arrange (Given)
        const array = [1, 2, 3, 4, 5];

        // Act (When) & Assert (Then)
        expect(() => {
          expectArrayToContainEqual(array, 3);
        }).not.toThrow();

        expect(() => {
          expectArrayToContainEqual(array, 99);
        }).toThrow();
      });

      it('should work with nested objects', () => {
        // Arrange (Given)
        const array = [
          { id: 1, nested: { value: 'a' } },
          { id: 2, nested: { value: 'b' } },
        ];
        const expectedItem = { id: 1, nested: { value: 'a' } };

        // Act (When) & Assert (Then)
        expect(() => {
          expectArrayToContainEqual(array, expectedItem);
        }).not.toThrow();
      });
    });
  });

  describe('expectObjectToContain()', () => {
    describe('when checking object contains expected properties', () => {
      it('should pass when object contains all expected properties', () => {
        // Arrange (Given)
        const actual = {
          id: 1,
          name: 'test',
          age: 20,
          email: 'test@example.com',
        };
        const expected = {
          id: 1,
          name: 'test',
        };

        // Act (When) & Assert (Then)
        expect(() => {
          expectObjectToContain(actual, expected);
        }).not.toThrow();
      });

      it('should throw when object missing properties', () => {
        // Arrange (Given)
        const actual = {
          id: 1,
          name: 'test',
        };
        const expected = {
          id: 1,
          name: 'test',
          age: 20, // Missing in actual
        };

        // Act (When) & Assert (Then)
        expect(() => {
          expectObjectToContain(actual, expected);
        }).toThrow();
      });

      it('should check property values match', () => {
        // Arrange (Given)
        const actual = {
          id: 1,
          name: 'test',
        };
        const expected = {
          id: 2, // Different value
          name: 'test',
        };

        // Act (When) & Assert (Then)
        expect(() => {
          expectObjectToContain(actual, expected);
        }).toThrow();
      });

      it('should work with nested objects', () => {
        // Arrange (Given)
        const actual = {
          id: 1,
          nested: {
            value: 'test',
            deep: {
              data: 42,
            },
          },
        };
        const expected = {
          nested: {
            value: 'test',
            deep: {
              data: 42,
            },
          },
        };

        // Act (When) & Assert (Then)
        expect(() => {
          expectObjectToContain(actual, expected);
        }).not.toThrow();
      });
    });
  });

  describe('expectToBeInRange()', () => {
    describe('when checking value is in range', () => {
      it('should pass when value is in range', () => {
        // Arrange (Given) & Act (When) & Assert (Then)
        expect(() => {
          expectToBeInRange(50, 0, 100);
        }).not.toThrow();

        expect(() => {
          expectToBeInRange(0, 0, 100); // Boundary: min
        }).not.toThrow();

        expect(() => {
          expectToBeInRange(100, 0, 100); // Boundary: max
        }).not.toThrow();
      });

      it('should throw when value is out of range', () => {
        // Arrange (Given) & Act (When) & Assert (Then)
        expect(() => {
          expectToBeInRange(-1, 0, 100); // Below min
        }).toThrow();

        expect(() => {
          expectToBeInRange(101, 0, 100); // Above max
        }).toThrow();
      });

      it('should work with decimal values', () => {
        // Arrange (Given) & Act (When) & Assert (Then)
        expect(() => {
          expectToBeInRange(50.5, 0, 100);
        }).not.toThrow();

        expect(() => {
          expectToBeInRange(99.99, 0, 100);
        }).not.toThrow();

        expect(() => {
          expectToBeInRange(100.01, 0, 100);
        }).toThrow();
      });

      it('should work with negative ranges', () => {
        // Arrange (Given) & Act (When) & Assert (Then)
        expect(() => {
          expectToBeInRange(-5, -10, 0);
        }).not.toThrow();

        expect(() => {
          expectToBeInRange(-11, -10, 0);
        }).toThrow();
      });
    });
  });
});
