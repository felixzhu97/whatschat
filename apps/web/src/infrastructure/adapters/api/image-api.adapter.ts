import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import { ApiResponse } from "../../../application/dto/api-response.dto";

export interface ImageGenerateResponse {
  jobId: string;
}

export interface ImageResultResponse {
  status: "pending" | "succeeded" | "failed";
  imageUrl?: string;
  error?: string;
}

export class ImageApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async generate(
    prompt: string,
    negativePrompt?: string
  ): Promise<ApiResponse<ImageGenerateResponse>> {
    return this.apiClient.post<ImageGenerateResponse>("/image/generate", {
      prompt,
      ...(negativePrompt != null && { negativePrompt }),
    });
  }

  async getResult(jobId: string): Promise<ApiResponse<ImageResultResponse>> {
    return this.apiClient.get<ImageResultResponse>(`/image/generate/${jobId}`);
  }
}
