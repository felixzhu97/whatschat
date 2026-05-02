import { describe, it, expect } from "vitest";

describe.skip("Test", () => {
  it("should be skipped", () => {
    expect(true).toBe(true);
  });
});
