import axios from 'axios';
import { API_V1 } from '@/src/config/api';

let tokenCache: string | null = null;
let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setApiToken(token: string | null) {
  tokenCache = token;
}

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | null) {
  unauthorizedHandler = handler;
}

export function createApiClient() {
  const client = axios.create({
    baseURL: API_V1,
    headers: tokenCache ? { Authorization: `Bearer ${tokenCache}` } : {},
  });
  client.interceptors.request.use(async (config) => {
    if (tokenCache) {
      config.headers.Authorization = `Bearer ${tokenCache}`;
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        await unauthorizedHandler?.();
      }
      return Promise.reject(error);
    }
  );
  return client;
}

export const apiClient = createApiClient();
