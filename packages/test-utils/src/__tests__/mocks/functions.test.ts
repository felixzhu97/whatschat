import { describe, it, expect, vi } from 'vitest';
import { createMockFunction, createAsyncMockFunction } from '../../mocks/functions';

describe('Mock Functions', () => {
  describe('createMockFunction()', () => {
    describe('when creating a mock function', () => {
      it('should create a mock function (Vitest)', () => {
        // Arrange (Given) & Act (When)
        const mockFn = createMockFunction<(id: string) => string>();

        // Assert (Then)
        expect(mockFn).toBeDefined();
        expect(typeof mockFn).toBe('function');
      });

      it('should allow setting return values', () => {
        // Arrange (Given)
        const mockFn = createMockFunction<(id: string) => string>();
        const expectedValue = 'test-result';

        // Act (When)
        mockFn.mockReturnValue(expectedValue);
        const result = mockFn('test-id');

        // Assert (Then)
        expect(result).toBe(expectedValue);
        expect(mockFn).toHaveBeenCalledWith('test-id');
      });

      it('should track function calls', () => {
        // Arrange (Given)
        const mockFn = createMockFunction<(id: string) => number>();

        // Act (When)
        mockFn.mockReturnValue(42);
        mockFn('id-1');
        mockFn('id-2');
        mockFn('id-3');

        // Assert (Then)
        expect(mockFn).toHaveBeenCalledTimes(3);
      });

      it('should allow setting implementation', () => {
        // Arrange (Given)
        const mockFn = createMockFunction<(x: number, y: number) => number>();
        const implementation = (x: number, y: number) => x + y;

        // Act (When)
        mockFn.mockImplementation(implementation);
        const result = mockFn(5, 3);

        // Assert (Then)
        expect(result).toBe(8);
      });

      it('should allow clearing mock', () => {
        // Arrange (Given)
        const mockFn = createMockFunction<() => string>();
        mockFn.mockReturnValue('test');
        mockFn();

        // Act (When)
        mockFn.mockClear();

        // Assert (Then)
        expect(mockFn).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('createAsyncMockFunction()', () => {
    describe('when creating an async mock function', () => {
      it('should create an async mock function', async () => {
        // Arrange (Given) & Act (When)
        const mockAsyncFn = createAsyncMockFunction<
          (id: string) => Promise<string>
        >();

        // Assert (Then)
        expect(mockAsyncFn).toBeDefined();
        expect(typeof mockAsyncFn).toBe('function');
      });

      it('should allow setting resolved values', async () => {
        // Arrange (Given)
        const mockAsyncFn = createAsyncMockFunction<
          (id: string) => Promise<string>
        >();
        const expectedValue = 'async-result';

        // Act (When)
        mockAsyncFn.mockResolvedValue(expectedValue);
        const result = await mockAsyncFn('test-id');

        // Assert (Then)
        expect(result).toBe(expectedValue);
        expect(mockAsyncFn).toHaveBeenCalledWith('test-id');
      });

      it('should allow setting rejected values', async () => {
        // Arrange (Given)
        const mockAsyncFn = createAsyncMockFunction<
          (id: string) => Promise<string>
        >();
        const error = new Error('Test error');

        // Act (When)
        mockAsyncFn.mockRejectedValue(error);

        // Assert (Then)
        await expect(mockAsyncFn('test-id')).rejects.toThrow('Test error');
      });

      it('should track async function calls', async () => {
        // Arrange (Given)
        const mockAsyncFn = createAsyncMockFunction<
          (id: string) => Promise<number>
        >();

        // Act (When)
        mockAsyncFn.mockResolvedValue(42);
        await mockAsyncFn('id-1');
        await mockAsyncFn('id-2');

        // Assert (Then)
        expect(mockAsyncFn).toHaveBeenCalledTimes(2);
      });

      it('should allow setting async implementation', async () => {
        // Arrange (Given)
        const mockAsyncFn = createAsyncMockFunction<
          (x: number) => Promise<number>
        >();
        const implementation = async (x: number) => x * 2;

        // Act (When)
        mockAsyncFn.mockImplementation(implementation);
        const result = await mockAsyncFn(5);

        // Assert (Then)
        expect(result).toBe(10);
      });
    });
  });
});
