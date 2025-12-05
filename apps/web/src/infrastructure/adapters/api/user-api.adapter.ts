import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import { ApiResponse } from "../../../application/dto/api-response.dto";

export class UserApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.apiClient.get(endpoint);
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    return this.apiClient.get(`/users/${userId}`);
  }

  async searchUsers(query: string): Promise<ApiResponse> {
    return this.apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  }
}

