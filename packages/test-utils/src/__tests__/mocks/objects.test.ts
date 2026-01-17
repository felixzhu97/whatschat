import { describe, it, expect } from 'vitest';
import {
  createMockObject,
  createPartialMock,
  createMockFunction,
  createAsyncMockFunction,
} from '../../mocks';

interface ApiClient {
  get: (url: string) => any;
  post: (url: string, data: any) => Promise<any>;
  baseUrl: string;
}

describe('Mock Objects', () => {
  describe('createMockObject()', () => {
    describe('when creating a mock object', () => {
      it('should create a mock object with provided properties', () => {
        // Arrange (Given)
        const baseUrl = 'https://api.example.com';

        // Act (When)
        const mockApi = createMockObject<ApiClient>({
          baseUrl,
        });

        // Assert (Then)
        expect(mockApi).toBeDefined();
        expect(mockApi.baseUrl).toBe(baseUrl);
      });

      it('should handle mock functions in properties', () => {
        // Arrange (Given)
        const mockGet = createMockFunction<(url: string) => any>();
        const mockPost = createAsyncMockFunction<
          (url: string, data: any) => Promise<any>
        >();
        mockGet.mockReturnValue({ data: 'test' });

        // Act (When)
        const mockApi = createMockObject<ApiClient>({
          get: mockGet,
          post: mockPost,
          baseUrl: 'https://api.example.com',
        });

        // Assert (Then)
        expect(mockApi.get).toBeDefined();
        expect(mockApi.post).toBeDefined();
        expect(mockApi.get('test')).toEqual({ data: 'test' });
      });

      it('should create mock object with mixed property types', () => {
        // Arrange (Given)
        interface MixedObject {
          value: number;
          fn: () => string;
          asyncFn: () => Promise<string>;
          nested: {
            prop: string;
          };
        }

        const mockFn = createMockFunction<() => string>();
        mockFn.mockReturnValue('test');

        // Act (When)
        const mockObj = createMockObject<MixedObject>({
          value: 42,
          fn: mockFn,
          asyncFn: createAsyncMockFunction(),
          nested: {
            prop: 'nested-value',
          },
        });

        // Assert (Then)
        expect(mockObj.value).toBe(42);
        expect(mockObj.fn()).toBe('test');
        expect(mockObj.nested.prop).toBe('nested-value');
      });
    });
  });

  describe('createPartialMock()', () => {
    describe('when creating a partial mock', () => {
      it('should merge base object with overrides', () => {
        // Arrange (Given)
        const base: ApiClient = {
          get: (url: string) => ({ data: 'original' }),
          post: async (url: string, data: any) => ({ data: 'original' }),
          baseUrl: 'https://original.com',
        };
        const mockGet = createMockFunction<(url: string) => any>();
        mockGet.mockReturnValue({ data: 'mocked' });

        // Act (When)
        const mock = createPartialMock(base, {
          get: mockGet,
        });

        // Assert (Then)
        expect(mock.baseUrl).toBe('https://original.com'); // Original preserved
        expect(mock.get).toBe(mockGet); // Overridden
        expect(mock.post).toBe(base.post); // Original preserved
        expect(mock.get('test')).toEqual({ data: 'mocked' });
      });

      it('should allow overriding multiple properties', () => {
        // Arrange (Given)
        const base = {
          a: 1,
          b: 2,
          c: 3,
        };
        const mockB = createMockFunction<() => number>();
        mockB.mockReturnValue(999);

        // Act (When)
        const mock = createPartialMock(base, {
          b: mockB,
          c: 888,
        });

        // Assert (Then)
        expect(mock.a).toBe(1);
        expect(mock.b).toBe(mockB);
        expect(mock.c).toBe(888);
      });

      it('should preserve original object reference for non-overridden properties', () => {
        // Arrange (Given)
        const originalFn = () => 'original';
        const base = {
          a: 1,
          fn: originalFn,
        };

        // Act (When)
        const mock = createPartialMock(base, {
          a: 2,
        });

        // Assert (Then)
        expect(mock.fn).toBe(originalFn);
      });
    });
  });
});
