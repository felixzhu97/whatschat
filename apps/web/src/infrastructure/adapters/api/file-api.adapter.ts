import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import type { ApiResponse } from "@/domain/dto/api-response.dto";

export class FileApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async uploadFile(
    file: File,
    type: "avatar" | "message" | "status"
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", type === "avatar" ? "avatars" : type);
    return this.apiClient.upload("/media/upload", formData);
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.apiClient.delete(`/files/${fileId}`);
  }
}

