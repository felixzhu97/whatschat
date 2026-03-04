import { createReplicateAdapter } from './replicate-adapter';
import type {
  GeneratePayload,
  GenerateResult,
  GetResultResponse,
  ReplicateClientOptions,
  HttpImageClientOptions,
} from './types';

export type ImageClientOptions = ReplicateClientOptions | HttpImageClientOptions;

function isReplicateOptions(opts: ImageClientOptions): opts is ReplicateClientOptions {
  return 'replicateApiToken' in opts && typeof opts.replicateApiToken === 'string';
}

export function createClient(options: ImageClientOptions) {
  if (isReplicateOptions(options)) {
    return createReplicateAdapter(options.replicateApiToken);
  }
  const baseUrl = options.imageApiBaseUrl.replace(/\/$/, '');
  return {
    async generate(payload: GeneratePayload): Promise<GenerateResult> {
      const res = await fetch(`${baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Image API error: ${res.status}`);
      const data = (await res.json()) as { jobId: string };
      return { jobId: data.jobId };
    },
    async getResult(jobId: string): Promise<GetResultResponse> {
      const res = await fetch(`${baseUrl}/generate/${jobId}`);
      if (!res.ok) throw new Error(`Image API error: ${res.status}`);
      return res.json() as Promise<GetResultResponse>;
    },
  };
}
