import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import { ApiResponse } from "../../../application/dto/api-response.dto";

export class FileApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async uploadFile(
    file: File,
    type: "avatar" | "message" | "status"
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return this.apiClient.upload("/files/upload", formData);
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.apiClient.delete(`/files/${fileId}`);
  }
}

