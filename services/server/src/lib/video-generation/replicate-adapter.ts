import Replicate from 'replicate';
import type { GeneratePayload, GenerateResult, GetResultResponse } from './types';

const SVD_MODEL = 'christophy/stable-video-diffusion';
const SVD_VERSION = '43b6ee89028ca4ded3497f711e814ae5a0d619287136763c5616968194aff574';

export function createReplicateAdapter(token: string) {
  const replicate = new Replicate({ auth: token });

  async function generate(payload: GeneratePayload): Promise<GenerateResult> {
    const input: Record<string, string> = {
      input_image: payload.imageUrl ?? '',
    };
    if (payload.prompt) input['prompt'] = payload.prompt;
    const prediction = await replicate.predictions.create({
      model: SVD_MODEL,
      version: SVD_VERSION,
      input,
    });
    return { jobId: prediction.id };
  }

  async function getResult(jobId: string): Promise<GetResultResponse> {
    const prediction = await replicate.predictions.get(jobId);
    const status = prediction.status as 'pending' | 'succeeded' | 'failed';
    if (status === 'succeeded' && prediction.output != null) {
      const output = prediction.output as string | string[];
      const videoUrl = typeof output === 'string' ? output : output[0];
      const base = { status: 'succeeded' as const };
      return typeof videoUrl === 'string'
        ? { ...base, videoUrl }
        : base;
    }
    if (status === 'failed') {
      const err = (prediction as { error?: string }).error;
      return { status: 'failed', error: err ?? 'Unknown error' };
    }
    return { status: 'pending' };
  }

  return { generate, getResult };
}
