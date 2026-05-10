import { describe, it, expect } from "vitest";
import { formatDuration } from "../../rtc/application/format-duration";

describe("formatDuration", () => {
  describe("when seconds is zero", () => {
    it("should return 0:00", () => {
      expect(formatDuration(0)).toBe("0:00");
    });
  });

  describe("when seconds is less than a minute", () => {
    it("should format seconds only", () => {
      expect(formatDuration(1)).toBe("0:01");
      expect(formatDuration(5)).toBe("0:05");
      expect(formatDuration(30)).toBe("0:30");
      expect(formatDuration(59)).toBe("0:59");
    });

    it("should pad single digit seconds with zero", () => {
      expect(formatDuration(1)).toBe("0:01");
      expect(formatDuration(9)).toBe("0:09");
    });
  });

  describe("when seconds is exactly one minute", () => {
    it("should format as 1:00", () => {
      expect(formatDuration(60)).toBe("1:00");
    });
  });

  describe("when seconds is multiple of 60 but less than an hour", () => {
    it("should format minutes and seconds", () => {
      expect(formatDuration(120)).toBe("2:00");
      expect(formatDuration(300)).toBe("5:00");
      expect(formatDuration(3600 - 1)).toBe("59:59");
    });

    it("should pad single digit minutes with zero", () => {
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(600)).toBe("10:00");
      expect(formatDuration(3540)).toBe("59:00");
    });
  });

  describe("when seconds is between 60 and 3600", () => {
    it("should format minutes and seconds correctly", () => {
      expect(formatDuration(65)).toBe("1:05");
      expect(formatDuration(125)).toBe("2:05");
      expect(formatDuration(3599)).toBe("59:59");
    });

    it("should pad minutes with leading zeros when needed", () => {
      expect(formatDuration(61)).toBe("1:01");
      expect(formatDuration(600 + 5)).toBe("10:05");
    });
  });

  describe("when seconds is exactly one hour", () => {
    it("should format as 1:00:00", () => {
      expect(formatDuration(3600)).toBe("1:00:00");
    });
  });

  describe("when seconds is more than one hour", () => {
    it("should format with hours, minutes, and seconds", () => {
      expect(formatDuration(3661)).toBe("1:01:01");
      expect(formatDuration(7200)).toBe("2:00:00");
      expect(formatDuration(36000)).toBe("10:00:00");
    });

    it("should pad minutes with leading zeros", () => {
      expect(formatDuration(3600 + 60)).toBe("1:01:00");
      expect(formatDuration(3600 + 600)).toBe("1:10:00");
      expect(formatDuration(3600 + 3660)).toBe("2:01:00");
    });

    it("should pad seconds with leading zeros", () => {
      expect(formatDuration(3600 + 1)).toBe("1:00:01");
      expect(formatDuration(3600 + 65)).toBe("1:01:05");
    });

    it("should handle large hour values", () => {
      expect(formatDuration(86400)).toBe("24:00:00");
      expect(formatDuration(90000)).toBe("25:00:00");
    });
  });

  describe("edge cases", () => {
    it("should handle boundary between minutes and hours", () => {
      expect(formatDuration(3599)).toBe("59:59");
      expect(formatDuration(3600)).toBe("1:00:00");
    });

    it("should handle boundary between seconds and minutes", () => {
      expect(formatDuration(59)).toBe("0:59");
      expect(formatDuration(60)).toBe("1:00");
    });
  });
});
