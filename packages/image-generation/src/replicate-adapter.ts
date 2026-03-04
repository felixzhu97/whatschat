import Replicate from 'replicate';
import type { GeneratePayload, GenerateResult, GetResultResponse } from './types';

const SDXL_MODEL = 'stability-ai/sdxl';
const SDXL_VERSION = '39a52a2a03a4faf0651640ac8a542059c52f2d04fc26c8b83e22b0a957ffedd3';

export function createReplicateAdapter(token: string) {
  const replicate = new Replicate({ auth: token });

  async function generate(payload: GeneratePayload): Promise<GenerateResult> {
    const input: Record<string, string> = {
      prompt: payload.prompt,
    };
    if (payload.negativePrompt) input.negative_prompt = payload.negativePrompt;
    const prediction = await replicate.predictions.create({
      model: SDXL_MODEL,
      version: SDXL_VERSION,
      input,
    });
    return { jobId: prediction.id };
  }

  async function getResult(jobId: string): Promise<GetResultResponse> {
    const prediction = await replicate.predictions.get(jobId);
    const status = prediction.status as 'pending' | 'succeeded' | 'failed';
    if (status === 'succeeded' && prediction.output != null) {
      const output = prediction.output as string | string[];
      const imageUrl = Array.isArray(output) ? output[0] : output;
      return { status: 'succeeded', imageUrl };
    }
    if (status === 'failed') {
      const err = (prediction as { error?: string }).error;
      return { status: 'failed', error: err ?? 'Unknown error' };
    }
    return { status: 'pending' };
  }

  return { generate, getResult };
}
