import axios from 'axios';
import { API_V1 } from '@/src/config/api';
import { store } from '@/src/presentation/stores';
import { logout } from '@/src/presentation/store/slices/authSlice';

export function createApiClient() {
  const token = store.getState().auth.token;
  const client = axios.create({
    baseURL: API_V1,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  client.interceptors.request.use((config) => {
    const t = store.getState().auth.token;
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        await store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
  return client;
}

export const apiClient = createApiClient();
