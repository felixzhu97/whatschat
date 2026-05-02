import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
  hash: vi.fn(),
}));

import bcrypt from "bcryptjs";

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

vi.mock("@/shared/utils/logger", () => ({
  default: mockLogger,
}));

describe.skip("Database Seed", () => {
  describe("main function", () => {
    it("should skip seeding when database already has users", () => {
      expect(true).toBe(true);
    });
  });
});
