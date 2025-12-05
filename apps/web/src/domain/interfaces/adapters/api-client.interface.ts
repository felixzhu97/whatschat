import { ApiResponse } from "../../../application/dto/api-response.dto";

export interface IApiClient {
  setToken(token: string | null): void;
  getToken(): string | null;
  get<T>(endpoint: string): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>;
  upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>>;
}

