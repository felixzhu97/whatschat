import { describe, it, expect } from "vitest";
import type { ApiResponse, Pagination } from "../transport";

describe("Transport Types", () => {
  // ============================================================
  // ApiResponse - Test the generic API response interface
  // ============================================================
  describe("ApiResponse", () => {
    // ---- Successful responses ----
    describe("when creating successful responses", () => {
      it("should create a successful response with data", () => {
        const response: ApiResponse = {
          success: true,
          data: { id: "user-1", name: "John Doe" },
        };

        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data).toEqual({ id: "user-1", name: "John Doe" });
      });

      it("should create a successful response with null data", () => {
        const response: ApiResponse = {
          success: true,
          data: null,
        };

        expect(response.success).toBe(true);
        expect(response.data).toBeNull();
      });

      it("should create a successful response with undefined data", () => {
        const response: ApiResponse = {
          success: true,
        };

        expect(response.success).toBe(true);
        expect(response.data).toBeUndefined();
      });

      it("should create a successful response with optional message", () => {
        const response: ApiResponse = {
          success: true,
          data: { id: "user-1", name: "John Doe" },
          message: "Operation completed successfully",
        };

        expect(response.message).toBe("Operation completed successfully");
      });
    });

    // ---- Error responses ----
    describe("when creating error responses", () => {
      it("should create an error response with error message", () => {
        const response: ApiResponse = {
          success: false,
          error: "User not found",
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe("User not found");
      });

      it("should create an error response without data", () => {
        const response: ApiResponse = {
          success: false,
          error: "Invalid credentials",
        };

        expect(response.data).toBeUndefined();
      });

      it("should create an error response with optional message", () => {
        const response: ApiResponse = {
          success: false,
          error: "Network error",
          message: "Please check your internet connection",
        };

        expect(response.message).toBe("Please check your internet connection");
      });

      it("should create an error response with error details", () => {
        const response: ApiResponse<string> = {
          success: false,
          error: "Validation error",
          data: "Field 'email' is required",
        };

        expect(response.data).toBe("Field 'email' is required");
      });
    });

    // ---- Generic type support ----
    describe("when using generic data type", () => {
      it("should support string type", () => {
        const stringResponse: ApiResponse<string> = {
          success: true,
          data: "Hello, World!",
        };

        expect(stringResponse.data).toBe("Hello, World!");
        expect(typeof stringResponse.data).toBe("string");
      });

      it("should support number type", () => {
        const numberResponse: ApiResponse<number> = {
          success: true,
          data: 42,
        };

        expect(numberResponse.data).toBe(42);
      });

      it("should support boolean type", () => {
        const booleanResponse: ApiResponse<boolean> = {
          success: true,
          data: true,
        };

        expect(booleanResponse.data).toBe(true);
      });

      it("should support array type", () => {
        const arrayResponse: ApiResponse<number[]> = {
          success: true,
          data: [1, 2, 3, 4, 5],
        };

        expect(arrayResponse.data).toHaveLength(5);
        expect(arrayResponse.data).toContain(1);
        expect(arrayResponse.data).toContain(5);
      });

      it("should support object type", () => {
        const objectResponse: ApiResponse<{ key: string }> = {
          success: true,
          data: { key: "value" },
        };

        expect(objectResponse.data?.key).toBe("value");
      });

      it("should support complex nested object type", () => {
        interface UserProfile {
          id: string;
          name: string;
          preferences: {
            theme: string;
            notifications: boolean;
          };
        }

        const profileResponse: ApiResponse<UserProfile> = {
          success: true,
          data: {
            id: "user-1",
            name: "John Doe",
            preferences: {
              theme: "dark",
              notifications: true,
            },
          },
        };

        expect(profileResponse.data?.preferences.theme).toBe("dark");
        expect(profileResponse.data?.preferences.notifications).toBe(true);
      });

      it("should support Promise type", () => {
        const promiseResponse: ApiResponse<Promise<string>> = {
          success: true,
        };

        expect(promiseResponse.success).toBe(true);
      });

      it("should support void type", () => {
        const voidResponse: ApiResponse<void> = {
          success: true,
        };

        expect(voidResponse.success).toBe(true);
      });

      it("should support Map type", () => {
        const mapResponse: ApiResponse<Map<string, number>> = {
          success: true,
          data: new Map([["key", 42]]),
        };

        expect(mapResponse.data?.get("key")).toBe(42);
      });

      it("should support Set type", () => {
        const setResponse: ApiResponse<Set<string>> = {
          success: true,
          data: new Set(["a", "b", "c"]),
        };

        expect(setResponse.data?.size).toBe(3);
      });
    });

    // ---- Edge cases ----
    describe("edge cases", () => {
      it("should handle empty string error", () => {
        const response: ApiResponse = {
          success: false,
          error: "",
        };

        expect(response.error).toBe("");
      });

      it("should handle empty object data", () => {
        const response: ApiResponse = {
          success: true,
          data: {},
        };

        expect(response.data).toEqual({});
      });

      it("should handle empty array data", () => {
        const response: ApiResponse<[]> = {
          success: true,
          data: [],
        };

        expect(response.data).toHaveLength(0);
      });

      it("should handle zero as valid data", () => {
        const response: ApiResponse<number> = {
          success: true,
          data: 0,
        };

        expect(response.data).toBe(0);
      });

      it("should handle false as valid data", () => {
        const response: ApiResponse<boolean> = {
          success: true,
          data: false,
        };

        expect(response.data).toBe(false);
      });

      it("should handle undefined error in success response", () => {
        const response: ApiResponse = {
          success: true,
          error: undefined,
        };

        expect(response.error).toBeUndefined();
      });

      it("should allow both error and data for partial success scenarios", () => {
        const response: ApiResponse<{ items: string[]; warnings: string[] }> = {
          success: true,
          data: { items: ["a", "b"], warnings: ["One item was skipped"] },
        };

        expect(response.data?.items).toHaveLength(2);
        expect(response.data?.warnings).toHaveLength(1);
      });
    });
  });

  // ============================================================
  // Pagination - Test the pagination interface
  // ============================================================
  describe("Pagination", () => {
    // ---- Basic pagination ----
    describe("when creating pagination objects", () => {
      it("should create a valid pagination object with all fields", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(20);
        expect(pagination.total).toBe(100);
        expect(pagination.hasMore).toBe(true);
      });

      it("should have page greater than or equal to 1", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.page).toBeGreaterThanOrEqual(1);
      });

      it("should have positive limit", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.limit).toBeGreaterThan(0);
      });

      it("should have non-negative total", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false,
        };

        expect(pagination.total).toBeGreaterThanOrEqual(0);
      });
    });

    // ---- hasMore scenarios ----
    describe("when determining if there are more pages", () => {
      it("should indicate hasMore when total exceeds page limit", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.hasMore).toBe(true);
        expect(pagination.total).toBeGreaterThan(pagination.limit * pagination.page);
      });

      it("should indicate hasMore when on intermediate page", () => {
        const pagination: Pagination = {
          page: 2,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.hasMore).toBe(true);
      });

      it("should indicate no more pages when on last page", () => {
        const pagination: Pagination = {
          page: 5,
          limit: 20,
          total: 100,
          hasMore: false,
        };

        expect(pagination.hasMore).toBe(false);
      });

      it("should calculate hasMore based on page and limit", () => {
        const page = 3;
        const limit = 20;
        const total = 100;
        const expectedHasMore = page * limit < total;

        const pagination: Pagination = {
          page,
          limit,
          total,
          hasMore: expectedHasMore,
        };

        expect(pagination.hasMore).toBe(page * limit < total);
      });
    });

    // ---- Single page results ----
    describe("when handling single page results", () => {
      it("should set hasMore to false when total is less than limit", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 15,
          hasMore: false,
        };

        expect(pagination.hasMore).toBe(false);
        expect(pagination.total).toBeLessThan(pagination.limit);
      });

      it("should set hasMore to false when total equals limit", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 20,
          hasMore: false,
        };

        expect(pagination.total).toBeLessThanOrEqual(pagination.limit);
      });

      it("should handle single item result", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 1,
          hasMore: false,
        };

        expect(pagination.total).toBe(1);
      });
    });

    // ---- Empty results ----
    describe("when handling empty results", () => {
      it("should handle zero total", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false,
        };

        expect(pagination.total).toBe(0);
        expect(pagination.hasMore).toBe(false);
      });

      it("should handle empty results on page 1", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 0,
          hasMore: false,
        };

        expect(pagination.page).toBe(1);
      });

      it("should handle empty results on later pages", () => {
        const pagination: Pagination = {
          page: 10,
          limit: 20,
          total: 0,
          hasMore: false,
        };

        expect(pagination.page).toBeGreaterThan(1);
      });
    });

    // ---- Different page sizes ----
    describe("when supporting different page sizes", () => {
      it("should support small page size of 10", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 10,
          total: 50,
          hasMore: true,
        };

        expect(pagination.limit).toBe(10);
      });

      it("should support medium page size of 20", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 50,
          hasMore: true,
        };

        expect(pagination.limit).toBe(20);
      });

      it("should support large page size of 50", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 50,
          total: 100,
          hasMore: true,
        };

        expect(pagination.limit).toBe(50);
      });

      it("should support page size of 100", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 100,
          total: 200,
          hasMore: true,
        };

        expect(pagination.limit).toBe(100);
      });

      it("should support page size of 1 for pagination testing", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 1,
          total: 100,
          hasMore: true,
        };

        expect(pagination.limit).toBe(1);
      });
    });

    // ---- Multi-page scenarios ----
    describe("when handling multi-page scenarios", () => {
      it("should calculate correct number of pages", () => {
        const limit = 20;
        const total = 100;
        const expectedPages = Math.ceil(total / limit);

        expect(expectedPages).toBe(5);
      });

      it("should handle partial last page", () => {
        const limit = 20;
        const total = 95;
        const expectedPages = Math.ceil(total / limit);

        expect(expectedPages).toBe(5);
      });

      it("should handle large total with many pages", () => {
        const pagination: Pagination = {
          page: 100,
          limit: 20,
          total: 5000,
          hasMore: true,
        };

        expect(pagination.page).toBe(100);
        expect(Math.ceil(pagination.total / pagination.limit)).toBe(250);
      });

      it("should handle first page", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.page).toBe(1);
      });

      it("should handle last page detection", () => {
        const page = 5;
        const limit = 20;
        const total = 100;
        const isLastPage = page >= Math.ceil(total / limit);

        expect(isLastPage).toBe(true);
      });
    });

    // ---- Edge cases ----
    describe("edge cases", () => {
      it("should handle limit of 1", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 1,
          total: 1,
          hasMore: false,
        };

        expect(pagination.limit).toBe(1);
      });

      it("should handle very large total", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 1000000,
          hasMore: true,
        };

        expect(pagination.total).toBe(1000000);
      });

      it("should handle very large limit", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 10000,
          total: 10000,
          hasMore: false,
        };

        expect(pagination.limit).toBe(10000);
      });

      it("should handle page 0 as valid for some APIs", () => {
        const pagination: Pagination = {
          page: 0,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        expect(pagination.page).toBe(0);
      });

      it("should handle very large page numbers", () => {
        const pagination: Pagination = {
          page: 999999,
          limit: 20,
          total: 100,
          hasMore: false,
        };

        expect(pagination.page).toBe(999999);
      });

      it("should preserve immutability concept", () => {
        const pagination: Pagination = {
          page: 1,
          limit: 20,
          total: 100,
          hasMore: true,
        };

        const newPagination: Pagination = {
          ...pagination,
          page: 2,
        };

        expect(pagination.page).toBe(1);
        expect(newPagination.page).toBe(2);
      });
    });
  });
});
