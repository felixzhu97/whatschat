import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import { apiClient } from '@/src/infrastructure/api/client';
import { createHttpClientFromAxios } from '@/src/infrastructure/api/axios-http.adapter';

let httpSingleton: IHttpClient | null = null;

export function getHttpClient(): IHttpClient {
  if (!httpSingleton) {
    httpSingleton = createHttpClientFromAxios(apiClient);
  }
  return httpSingleton;
}
