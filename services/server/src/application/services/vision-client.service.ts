import { Injectable } from "@nestjs/common";
import { ConfigService } from "@/infrastructure/config/config.service";

@Injectable()
export class VisionClientService {
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async predictFromUrl(imageUrl: string): Promise<string[]> {
    if (!this.config.vision.enabled || !this.config.vision.serviceUrl) {
      return [];
    }
    const url = `${this.config.vision.serviceUrl}/predict`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.vision.timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as { labels?: string[] };
      return Array.isArray(data.labels) ? data.labels : [];
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  async predictFromBuffer(imageBuffer: Buffer, mimeType = "image/jpeg"): Promise<string[]> {
    if (!this.config.vision.enabled || !this.config.vision.serviceUrl || !imageBuffer?.length) {
      return [];
    }
    const endpoint = `${this.config.vision.serviceUrl}/predict`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.vision.timeoutMs);
    try {
      const formData = new FormData();
      formData.append("file", new Blob([imageBuffer], { type: mimeType }), "image.jpg");
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as { labels?: string[] };
      return Array.isArray(data.labels) ? data.labels : [];
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }
}
