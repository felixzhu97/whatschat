export type ImageJobStatus = 'pending' | 'succeeded' | 'failed';

export interface GeneratePayload {
  prompt: string;
  negativePrompt?: string;
}

export interface GenerateResult {
  jobId: string;
}

export interface GetResultResponse {
  status: ImageJobStatus;
  imageUrl?: string;
  error?: string;
}

export interface ReplicateClientOptions {
  replicateApiToken: string;
}

export interface HttpImageClientOptions {
  imageApiBaseUrl: string;
}
