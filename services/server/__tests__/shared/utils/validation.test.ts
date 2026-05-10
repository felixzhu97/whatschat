import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeInput,
  validateFileType,
  validateFileSize,
} from "@/shared/utils/validation";

describe("validateEmail", () => {
  it("should return true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("should return false for email without @", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });

  it("should return false for email without domain", () => {
    expect(validateEmail("test@")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(validateEmail("")).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });

  it("should trim whitespace", () => {
    expect(validateEmail("  test@example.com  ")).toBe(true);
  });
});

describe("validatePassword", () => {
  it("should return true for password with 6+ characters", () => {
    expect(validatePassword("123456")).toBe(true);
  });

  it("should return false for password less than 6 characters", () => {
    expect(validatePassword("12345")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(validatePassword("")).toBe(false);
  });

  it("should trim whitespace", () => {
    expect(validatePassword("   123456")).toBe(true);
  });
});

describe("validatePhone", () => {
  it("should return true for valid international phone number", () => {
    expect(validatePhone("+8613800138000")).toBe(true);
  });

  it("should return true for US phone number", () => {
    expect(validatePhone("+12025551234")).toBe(true);
  });

  it("should return false for phone without + prefix", () => {
    expect(validatePhone("12025551234")).toBe(false);
  });

  it("should return false for phone with spaces", () => {
    expect(validatePhone("+86 138 0013 8000")).toBe(true); // spaces are removed
  });

  it("should return false for too short phone number", () => {
    expect(validatePhone("+1")).toBe(false);
  });
});

describe("sanitizeInput", () => {
  it("should remove HTML script tags", () => {
    const input = "Hello <script>alert('xss')</script> World";
    expect(sanitizeInput(input)).toBe("Hello  World");
  });

  it("should remove HTML tags", () => {
    const input = "Hello <b>World</b>";
    expect(sanitizeInput(input)).toBe("Hello World");
  });

  it("should return empty string for null/undefined", () => {
    expect(sanitizeInput(null as any)).toBe("");
    expect(sanitizeInput(undefined as any)).toBe("");
  });

  it("should trim whitespace", () => {
    expect(sanitizeInput("  Hello World  ")).toBe("Hello World");
  });
});

describe("validateFileType", () => {
  it("should return true for allowed mime type", () => {
    expect(validateFileType("image/jpeg", ["image/jpeg", "image/png"])).toBe(true);
  });

  it("should return false for disallowed mime type", () => {
    expect(validateFileType("application/pdf", ["image/jpeg", "image/png"])).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(validateFileType(null as any, ["image/jpeg"])).toBe(false);
    expect(validateFileType(undefined as any, ["image/jpeg"])).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("should return true for size within limit", () => {
    expect(validateFileSize(1000, 5000)).toBe(true);
  });

  it("should return true for size equal to limit", () => {
    expect(validateFileSize(5000, 5000)).toBe(true);
  });

  it("should return false for size exceeding limit", () => {
    expect(validateFileSize(6000, 5000)).toBe(false);
  });

  it("should return false for negative size", () => {
    expect(validateFileSize(-1, 5000)).toBe(false);
  });
});
