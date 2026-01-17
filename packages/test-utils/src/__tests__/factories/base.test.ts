import { describe, it, expect } from 'vitest';
import { createFactory, createMany } from '../../factories/base';

describe('Factories', () => {
  describe('createFactory()', () => {
    describe('when creating a factory function', () => {
      it('should create a factory function that generates default values', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({
          id: 'test-id',
          name: 'Test Name',
          value: 42,
        }));

        // Act (When)
        const result = factory();

        // Assert (Then)
        expect(result).toEqual({
          id: 'test-id',
          name: 'Test Name',
          value: 42,
        });
      });

      it('should allow overriding default values', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({
          id: 'test-id',
          name: 'Test Name',
          value: 42,
        }));

        // Act (When)
        const result = factory({
          name: 'Custom Name',
          value: 100,
        });

        // Assert (Then)
        expect(result).toEqual({
          id: 'test-id',
          name: 'Custom Name',
          value: 100,
        });
        expect(result.id).toBe('test-id'); // Original value preserved
      });

      it('should allow partial overrides', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({
          id: 'test-id',
          name: 'Test Name',
          value: 42,
        }));

        // Act (When)
        const result = factory({
          name: 'Custom Name',
        });

        // Assert (Then)
        expect(result).toEqual({
          id: 'test-id',
          name: 'Custom Name',
          value: 42,
        });
      });

      it('should generate new default values on each call', () => {
        // Arrange (Given)
        let counter = 0;
        const factory = createFactory(() => ({
          id: `id-${counter++}`,
          value: counter,
        }));

        // Act (When)
        const result1 = factory();
        const result2 = factory();

        // Assert (Then)
        expect(result1.id).toBe('id-0');
        expect(result1.value).toBe(1);
        expect(result2.id).toBe('id-1');
        expect(result2.value).toBe(2);
      });
    });
  });

  describe('createMany()', () => {
    describe('when generating multiple instances', () => {
      it('should generate multiple instances using factory', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({
          id: 'test-id',
          name: 'Test Name',
        }));

        // Act (When)
        const results = createMany(factory, 3);

        // Assert (Then)
        expect(results).toHaveLength(3);
        results.forEach((result) => {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('name');
        });
      });

      it('should generate correct number of instances', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({ value: 1 }));

        // Act (When)
        const results = createMany(factory, 5);

        // Assert (Then)
        expect(results).toHaveLength(5);
      });

      it('should generate empty array when count is zero', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({ value: 1 }));

        // Act (When)
        const results = createMany(factory, 0);

        // Assert (Then)
        expect(results).toHaveLength(0);
        expect(results).toEqual([]);
      });

      it('should generate instances with unique references', () => {
        // Arrange (Given)
        const factory = createFactory(() => ({ value: 1 }));

        // Act (When)
        const results = createMany(factory, 2);

        // Assert (Then)
        expect(results[0]).not.toBe(results[1]); // Different object references
        expect(results[0]).toEqual(results[1]); // But equal values
      });
    });
  });
});
