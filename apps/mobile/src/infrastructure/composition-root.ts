import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import { apiClient } from '@/src/infrastructure/api/client';
import { createHttpClientFromAxios } from '@/src/infrastructure/api/axios-http.adapter';
import {
  AuthRepositoryAdapter,
  ChatRepositoryAdapter,
  FeedRepositoryAdapter,
  MessageRepositoryAdapter,
  UserRepositoryAdapter,
} from '@/src/infrastructure/adapters/repositories';
import {
  AuthUseCases,
  ChatUseCases,
  FeedUseCases,
  MessageUseCases,
  UserUseCases,
} from '@/src/application/use-cases';

let httpSingleton: IHttpClient | null = null;

export function getHttpClient(): IHttpClient {
  if (!httpSingleton) {
    httpSingleton = createHttpClientFromAxios(apiClient);
  }
  return httpSingleton;
}

let feedUseCases: FeedUseCases | null = null;
export function getFeedUseCases(): FeedUseCases {
  if (!feedUseCases) {
    feedUseCases = new FeedUseCases(new FeedRepositoryAdapter(getHttpClient()));
  }
  return feedUseCases;
}

let authUseCases: AuthUseCases | null = null;
export function getAuthUseCases(): AuthUseCases {
  if (!authUseCases) {
    authUseCases = new AuthUseCases(new AuthRepositoryAdapter(getHttpClient()));
  }
  return authUseCases;
}

let chatUseCases: ChatUseCases | null = null;
export function getChatUseCases(): ChatUseCases {
  if (!chatUseCases) {
    chatUseCases = new ChatUseCases(new ChatRepositoryAdapter(getHttpClient()));
  }
  return chatUseCases;
}

let messageUseCases: MessageUseCases | null = null;
export function getMessageUseCases(): MessageUseCases {
  if (!messageUseCases) {
    messageUseCases = new MessageUseCases(new MessageRepositoryAdapter(getHttpClient()));
  }
  return messageUseCases;
}

let userUseCases: UserUseCases | null = null;
export function getUserUseCases(): UserUseCases {
  if (!userUseCases) {
    userUseCases = new UserUseCases(new UserRepositoryAdapter());
  }
  return userUseCases;
}
