import { HttpResult, IHttpClient } from '../http-client.port';

describe('IHttpClient Port', () => {
  describe('HttpResult type', () => {
    it('should be an object with data property', () => {
      const result: HttpResult = { data: { id: 1 } };
      expect(result.data).toEqual({ id: 1 });
    });

    it('should support generic data type', () => {
      const result: HttpResult<string> = { data: 'hello' };
      expect(result.data).toBe('hello');
    });

    it('should support array data type', () => {
      const result: HttpResult<number[]> = { data: [1, 2, 3] };
      expect(result.data).toHaveLength(3);
    });

    it('should support object data type', () => {
      const result: HttpResult<{ name: string; age: number }> = {
        data: { name: 'John', age: 30 },
      };
      expect(result.data.name).toBe('John');
    });

    it('should support unknown type', () => {
      const result: HttpResult<unknown> = { data: { any: 'thing' } };
      expect(result.data).toBeDefined();
    });
  });

  describe('IHttpClient interface', () => {
    it('should define get method signature', () => {
      const mockClient: IHttpClient = {
        get: jest.fn().mockResolvedValue({ data: {} }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      expect(typeof mockClient.get).toBe('function');
    });

    it('should define post method signature', () => {
      const mockClient: IHttpClient = {
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({ data: {} }),
        put: jest.fn(),
        delete: jest.fn(),
      };

      expect(typeof mockClient.post).toBe('function');
    });

    it('should define put method signature', () => {
      const mockClient: IHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn(),
      };

      expect(typeof mockClient.put).toBe('function');
    });

    it('should define delete method signature', () => {
      const mockClient: IHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn().mockResolvedValue({ data: {} }),
      };

      expect(typeof mockClient.delete).toBe('function');
    });

    it('should return Promise for get method', async () => {
      const mockClient: IHttpClient = {
        get: jest.fn().mockResolvedValue({ data: 'test' }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      const result = await mockClient.get('/test');
      expect(result).toEqual({ data: 'test' });
    });

    it('should accept optional config parameter for get', async () => {
      const mockClient: IHttpClient = {
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      };

      await mockClient.get('/test', { params: { limit: 10 } });
      expect(mockClient.get).toHaveBeenCalledWith('/test', { params: { limit: 10 } });
    });

    it('should accept body and config for post', async () => {
      const mockClient: IHttpClient = {
        get: jest.fn(),
        post: jest.fn().mockResolvedValue({ data: {} }),
        put: jest.fn(),
        delete: jest.fn(),
      };

      await mockClient.post('/test', { key: 'value' }, { headers: {} });
      expect(mockClient.post).toHaveBeenCalledWith('/test', { key: 'value' }, { headers: {} });
    });
  });
});
