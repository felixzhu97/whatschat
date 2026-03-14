export const HTTP_URL_PREFIX = /^https?:\/\//i;
const DATA_URL_PREFIX = /^data:([^;]+);base64,(.+)$/i;

export function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } | null {
  const match = String(dataUrl).match(DATA_URL_PREFIX);
  if (!match || match[1] == null || match[2] == null) return null;
  try {
    const mimeType = match[1].trim() || "image/jpeg";
    const base64 = match[2];
    const buffer = Buffer.from(base64, "base64");
    return buffer.length > 0 ? { buffer, mimeType } : null;
  } catch {
    return null;
  }
}
