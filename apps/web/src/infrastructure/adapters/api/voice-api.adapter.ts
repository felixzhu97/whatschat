import { IApiClient } from "../../../domain/interfaces/adapters/api-client.interface";
import type { ApiResponse } from "@/domain/dto/api-response.dto";

export interface VoiceGenerateResponse {
  audioUrl: string;
  text?: string;
}

export interface VoiceTranslateResponse {
  translatedText: string;
}

export type VoiceTargetLang = "auto" | "zh" | "en";

export class VoiceApiAdapter {
  constructor(private apiClient: IApiClient) {}

  async generate(
    prompt: string,
    targetLang?: VoiceTargetLang
  ): Promise<ApiResponse<VoiceGenerateResponse>> {
    return this.apiClient.post<VoiceGenerateResponse>("/voice/generate", {
      prompt,
      ...(targetLang != null && { targetLang }),
    });
  }

  async translate(
    text: string,
    targetLang: "zh" | "en"
  ): Promise<ApiResponse<VoiceTranslateResponse>> {
    return this.apiClient.post<VoiceTranslateResponse>("/voice/translate", {
      text,
      targetLang,
    });
  }
}
