import { describe, it, expect } from "vitest";
import {
  sessionDescToPlain,
  type SessionDescInput,
} from "../../rtc/application/session-desc";

describe("sessionDescToPlain", () => {
  describe("when desc is null", () => {
    it("should return null", () => {
      expect(sessionDescToPlain(null)).toBeNull();
    });
  });

  describe("when desc has type and sdp", () => {
    it("should return valid RTCSessionDescriptionInit", () => {
      const desc: SessionDescInput = {
        type: "offer",
        sdp: "v=0\\r\\no=- 0 0 IN IP4 127.0.0.1\\r\\n",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({
        type: "offer",
        sdp: "v=0\\r\\no=- 0 0 IN IP4 127.0.0.1\\r\\n",
      });
    });

    it("should return valid answer type", () => {
      const desc: SessionDescInput = {
        type: "answer",
        sdp: "v=0\\r\\no=- 1 1 IN IP4 127.0.0.1\\r\\n",
      };
      const result = sessionDescToPlain(desc);
      expect(result?.type).toBe("answer");
    });

    it("should return valid pranswer type", () => {
      const desc: SessionDescInput = {
        type: "pranswer",
        sdp: "sdp content",
      };
      const result = sessionDescToPlain(desc);
      expect(result?.type).toBe("pranswer");
    });

    it("should return valid rollback type", () => {
      const desc: SessionDescInput = {
        type: "rollback",
        sdp: "",
      };
      const result = sessionDescToPlain(desc);
      expect(result?.type).toBe("rollback");
    });
  });

  describe("when desc uses underscore property names", () => {
    it("should use _type property", () => {
      const desc: SessionDescInput = {
        _type: "offer",
        _sdp: "sdp content",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({
        type: "offer",
        sdp: "sdp content",
      });
    });

    it("should prefer type over _type", () => {
      const desc: SessionDescInput = {
        type: "answer",
        _type: "offer",
        sdp: "primary sdp",
        _sdp: "secondary sdp",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({
        type: "answer",
        sdp: "primary sdp",
      });
    });

    it("should fall back to _sdp when sdp is undefined", () => {
      const desc: SessionDescInput = {
        _type: "offer",
        _sdp: "fallback sdp",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({
        type: "offer",
        sdp: "fallback sdp",
      });
    });
  });

  describe("when desc has missing type", () => {
    it("should return object with default type when sdp is provided", () => {
      const desc: SessionDescInput = {
        sdp: "some sdp",
      };
      const result = sessionDescToPlain(desc);
      expect(result?.sdp).toBe("some sdp");
      expect(result?.type).toBe("offer");
    });

    it("should use defaultType when provided and type is missing", () => {
      const desc: SessionDescInput = {
        sdp: "some sdp",
      };
      const result = sessionDescToPlain(desc, "answer");
      expect(result).toEqual({
        type: "answer",
        sdp: "some sdp",
      });
    });

    it("should use defaultType when provided and _type is missing", () => {
      const desc: SessionDescInput = {
        _sdp: "some sdp",
      };
      const result = sessionDescToPlain(desc, "answer");
      expect(result).toEqual({
        type: "answer",
        sdp: "some sdp",
      });
    });

    it("should prefer type over defaultType", () => {
      const desc: SessionDescInput = {
        type: "pranswer",
        sdp: "content",
      };
      const result = sessionDescToPlain(desc, "offer");
      expect(result?.type).toBe("pranswer");
    });
  });

  describe("when desc has empty or invalid sdp", () => {
    it("should return object with empty sdp when type is provided", () => {
      const desc: SessionDescInput = {
        type: "offer",
        sdp: "",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({ type: "offer", sdp: "" });
    });

    it("should return object with empty sdp when _type is provided", () => {
      const desc: SessionDescInput = {
        type: "offer",
        _sdp: "",
      };
      const result = sessionDescToPlain(desc);
      expect(result).toEqual({ type: "offer", sdp: "" });
    });

    it("should use defaultType when sdp is undefined", () => {
      const desc: SessionDescInput = {};
      const result = sessionDescToPlain(desc, "offer");
      expect(result).toEqual({
        type: "offer",
        sdp: "",
      });
    });
  });

  describe("when sdp is not a string", () => {
    it("should convert sdp to string when possible", () => {
      const desc: SessionDescInput = {
        type: "offer",
        // @ts-expect-error testing invalid input
        sdp: 123,
      };
      const result = sessionDescToPlain(desc);
      expect(typeof result?.sdp).toBe("string");
    });

    it("should handle numeric sdp values", () => {
      const desc: SessionDescInput = {
        _type: "answer",
        // @ts-expect-error testing invalid input
        _sdp: 456,
      };
      const result = sessionDescToPlain(desc);
      expect(typeof result?.sdp).toBe("string");
    });
  });

  describe("when type is explicitly null", () => {
    it("should fall back to _type or defaultType", () => {
      const desc: SessionDescInput = {
        type: null,
        _type: "offer",
        sdp: "content",
      };
      const result = sessionDescToPlain(desc);
      expect(result?.type).toBe("offer");
    });

    it("should fall back to defaultType when _type is also null", () => {
      const desc: SessionDescInput = {
        type: null,
        _type: null,
        sdp: "content",
      };
      const result = sessionDescToPlain(desc, "answer");
      expect(result?.type).toBe("answer");
    });
  });

  describe("edge cases", () => {
    it("should handle empty object", () => {
      expect(sessionDescToPlain({})).toBeNull();
    });

    it("should handle sdp as zero number", () => {
      const desc: SessionDescInput = {
        // @ts-expect-error testing edge case
        sdp: 0,
      };
      const result = sessionDescToPlain(desc);
      expect(typeof result?.sdp).toBe("string");
    });

    it("should return object with empty sdp when sdp is empty string", () => {
      const desc: SessionDescInput = {
        sdp: "",
      };
      const result = sessionDescToPlain(desc, "offer");
      expect(result?.sdp).toBe("");
    });
  });
});
