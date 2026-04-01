import { getApiClient } from "./adapters/api/api-client.adapter";
import type { IApiClient } from "../domain/interfaces/adapters/api-client.interface";
import { AuthApiAdapter } from "./adapters/api/auth-api.adapter";
import { ChatApiAdapter } from "./adapters/api/chat-api.adapter";
import { UserApiAdapter } from "./adapters/api/user-api.adapter";

export type AppComposition = {
  apiClient: IApiClient;
  chatApi: ChatApiAdapter;
  userApi: UserApiAdapter;
  authApi: AuthApiAdapter;
};

let composition: AppComposition | null = null;

export function getAppComposition(): AppComposition {
  if (!composition) {
    const apiClient = getApiClient();
    composition = {
      apiClient,
      chatApi: new ChatApiAdapter(apiClient),
      userApi: new UserApiAdapter(apiClient),
      authApi: new AuthApiAdapter(apiClient),
    };
  }
  return composition;
}
