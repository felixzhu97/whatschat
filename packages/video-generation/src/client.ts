import { createReplicateAdapter } from './replicate-adapter';
import type {
  GeneratePayload,
  GenerateResult,
  GetResultResponse,
  ReplicateClientOptions,
  HttpVideoClientOptions,
} from './types';

export type VideoClientOptions = ReplicateClientOptions | HttpVideoClientOptions;

function isReplicateOptions(opts: VideoClientOptions): opts is ReplicateClientOptions {
  return 'replicateApiToken' in opts && typeof opts.replicateApiToken === 'string';
}

export function createClient(options: VideoClientOptions) {
  if (isReplicateOptions(options)) {
    return createReplicateAdapter(options.replicateApiToken);
  }
  const baseUrl = options.videoApiBaseUrl.replace(/\/$/, '');
  return {
    async generate(payload: GeneratePayload): Promise<GenerateResult> {
      const res = await fetch(`${baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Video API error: ${res.status}`);
      const data = (await res.json()) as { jobId: string };
      return { jobId: data.jobId };
    },
    async getResult(jobId: string): Promise<GetResultResponse> {
      const res = await fetch(`${baseUrl}/generate/${jobId}`);
      if (!res.ok) throw new Error(`Video API error: ${res.status}`);
      return res.json() as Promise<GetResultResponse>;
    },
  };
}
