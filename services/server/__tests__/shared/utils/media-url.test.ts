import { describe, it, expect } from "vitest";
import { parseDataUrl, HTTP_URL_PREFIX } from "@/shared/utils/media-url";

describe("parseDataUrl", () => {
  it("should return null for invalid data URL", () => {
    expect(parseDataUrl("not-a-data-url")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseDataUrl("")).toBeNull();
  });

  it("should parse valid base64 data URL", () => {
    const base64 = Buffer.from("test content").toString("base64");
    const result = parseDataUrl(`data:text/plain;base64,${base64}`);
    
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("text/plain");
  });

  it("should return null for empty base64 content", () => {
    const result = parseDataUrl("data:image/jpeg;base64,");
    
    expect(result).toBeNull();
  });

  it("should return null for data URL without mime type", () => {
    const result = parseDataUrl("data:;base64,dGVzdA==");
    
    expect(result).toBeNull();
  });
});

describe("HTTP_URL_PREFIX", () => {
  it("should match http URLs", () => {
    expect(HTTP_URL_PREFIX.test("http://example.com")).toBe(true);
  });

  it("should match https URLs", () => {
    expect(HTTP_URL_PREFIX.test("https://example.com")).toBe(true);
  });

  it("should not match data URLs", () => {
    expect(HTTP_URL_PREFIX.test("data:image/png;base64,abc123")).toBe(false);
  });

  it("should not match relative URLs", () => {
    expect(HTTP_URL_PREFIX.test("/api/test")).toBe(false);
  });
});
