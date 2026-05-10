import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAuth } from "@/src/presentation/hooks/use-auth";
import { AuthService } from "@/src/application/services/auth.service";

vi.mock("@/src/application/services/auth.service", () => {
  const mockAuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  return {
    getAuthService: vi.fn(() => ({
      getAuthState: vi.fn(() => ({ ...mockAuthState })),
      login: vi.fn().mockResolvedValue({ success: true }),
      register: vi.fn().mockResolvedValue({ success: true }),
      logout: vi.fn().mockResolvedValue(undefined),
      updateUser: vi.fn().mockResolvedValue({ success: true }),
      changePassword: vi.fn().mockResolvedValue({ success: true }),
      forgotPassword: vi.fn().mockResolvedValue({ success: true }),
      resetPassword: vi.fn().mockResolvedValue({ success: true }),
      clearError: vi.fn(),
    })),
    AuthService: vi.fn(),
  };
});

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have user as null initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
    });

    it("should have isAuthenticated as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should have isLoading as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it("should have error as null initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.error).toBeNull();
    });
  });

  describe("login", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.login).toBe("function");
    });

    it("should call authService login", async () => {
      const { getAuthService } = await import("@/src/application/services/auth.service");
      const mockService = getAuthService() as any;

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login("test@example.com", "password");
      });

      expect(mockService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password",
      });
    });
  });

  describe("register", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.register).toBe("function");
    });

    it("should call authService register", async () => {
      const { getAuthService } = await import("@/src/application/services/auth.service");
      const mockService = getAuthService() as any;

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          username: "testuser",
          email: "test@example.com",
          password: "password",
        });
      });

      expect(mockService.register).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.logout).toBe("function");
    });

    it("should call authService logout", async () => {
      const { getAuthService } = await import("@/src/application/services/auth.service");
      const mockService = getAuthService() as any;

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockService.logout).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.updateUser).toBe("function");
    });
  });

  describe("changePassword", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.changePassword).toBe("function");
    });
  });

  describe("forgotPassword", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.forgotPassword).toBe("function");
    });
  });

  describe("resetPassword", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.resetPassword).toBe("function");
    });
  });

  describe("clearError", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.clearError).toBe("function");
    });

    it("should call authService clearError", async () => {
      const { getAuthService } = await import("@/src/application/services/auth.service");
      const mockService = getAuthService() as any;

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(mockService.clearError).toHaveBeenCalled();
    });
  });
});
