export type VideoJobStatus = 'pending' | 'succeeded' | 'failed';

export interface GeneratePayload {
  prompt: string;
  imageUrl?: string;
}

export interface GenerateResult {
  jobId: string;
}

export interface GetResultResponse {
  status: VideoJobStatus;
  videoUrl?: string;
  error?: string;
}

export interface ReplicateClientOptions {
  replicateApiToken: string;
}

export interface HttpVideoClientOptions {
  videoApiBaseUrl: string;
}
