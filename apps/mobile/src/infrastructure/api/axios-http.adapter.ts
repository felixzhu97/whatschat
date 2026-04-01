import type { AxiosInstance } from 'axios';
import type { IHttpClient } from '@/src/domain/ports/http-client.port';

export function createHttpClientFromAxios(instance: AxiosInstance): IHttpClient {
  return {
    get: (url, config) =>
      instance.get(url, config as never).then((r) => ({ data: r.data })),
    post: (url, body, config) =>
      instance.post(url, body, config as never).then((r) => ({ data: r.data })),
    put: (url, body, config) =>
      instance.put(url, body, config as never).then((r) => ({ data: r.data })),
    delete: (url, config) =>
      instance.delete(url, config as never).then((r) => ({ data: r.data })),
  };
}
