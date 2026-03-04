import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import { ApiResponse } from "../../../application/dto/api-response.dto";

export interface VideoGenerateResponse {
  jobId: string;
}

export interface VideoResultResponse {
  status: "pending" | "succeeded" | "failed";
  videoUrl?: string;
  error?: string;
}

export class VideoApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async generate(prompt: string, imageUrl?: string): Promise<ApiResponse<VideoGenerateResponse>> {
    return this.apiClient.post<VideoGenerateResponse>("/video/generate", {
      prompt,
      ...(imageUrl != null && { imageUrl }),
    });
  }

  async getResult(jobId: string): Promise<ApiResponse<VideoResultResponse>> {
    return this.apiClient.get<VideoResultResponse>(`/video/generate/${jobId}`);
  }
}
