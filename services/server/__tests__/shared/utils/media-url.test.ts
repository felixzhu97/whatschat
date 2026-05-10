import { describe, it, expect } from "vitest";
import { parseDataUrl, HTTP_URL_PREFIX } from "@/shared/utils/media-url";

describe("media-url utils", () => {
  describe("HTTP_URL_PREFIX", () => {
    it("should match http URLs", () => {
      expect(HTTP_URL_PREFIX.test("http://example.com")).toBe(true);
      expect(HTTP_URL_PREFIX.test("https://example.com")).toBe(true);
    });

    it("should not match non-http URLs", () => {
      expect(HTTP_URL_PREFIX.test("ftp://example.com")).toBe(false);
      expect(HTTP_URL_PREFIX.test("file://example.com")).toBe(false);
    });
  });

  describe("parseDataUrl", () => {
    it("should parse valid base64 data URL", () => {
      const base64Data = Buffer.from("test data").toString("base64");
      const dataUrl = `data:image/png;base64,${base64Data}`;

      const result = parseDataUrl(dataUrl);

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe("image/png");
      expect(result?.buffer).toBeInstanceOf(Buffer);
      expect(result?.buffer.toString()).toBe("test data");
    });

    it("should handle jpeg mime type", () => {
      const base64Data = Buffer.from("jpeg data").toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      const result = parseDataUrl(dataUrl);

      expect(result?.mimeType).toBe("image/jpeg");
    });

    it("should return null for invalid data URL", () => {
      expect(parseDataUrl("")).toBeNull();
      expect(parseDataUrl("not-a-data-url")).toBeNull();
      expect(parseDataUrl("data:no-base64")).toBeNull();
    });

    it("should return null for empty base64 content", () => {
      const dataUrl = "data:image/png;base64,";

      const result = parseDataUrl(dataUrl);

      expect(result).toBeNull();
    });

    it("should handle non-string input", () => {
      expect(parseDataUrl(null as any)).toBeNull();
      expect(parseDataUrl(undefined as any)).toBeNull();
    });
  });
});
