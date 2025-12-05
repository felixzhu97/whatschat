import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "@/src/presentation/hooks/use-auth";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.location
delete (window as any).location;
window.location = { href: "" } as any;

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("Login", () => {
    it("should login successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: "jwt-token",
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "whatsapp_user",
        JSON.stringify(mockUser)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "access_token",
        "jwt-token"
      );
    });

    it("should handle login failure", async () => {
      const mockResponse = {
        success: false,
        message: "邮箱或密码错误",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login("test@example.com", "wrongpassword");
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe("邮箱或密码错误");
    });

    it("should handle network errors during login", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe("Network error");
    });

    it("should set loading state during login", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(fetch).mockReturnValueOnce(promise as any);

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { user: {}, token: "token" },
            }),
        });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Register", () => {
    it("should register successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: "jwt-token",
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: "test@example.com",
          password: "password123",
          username: "testuser",
          phone: "+1234567890",
        });
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            username: "testuser",
            phone: "+1234567890",
          }),
        }
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it("should handle registration failure", async () => {
      const mockResponse = {
        success: false,
        message: "用户已存在",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: "existing@example.com",
          password: "password123",
          username: "existinguser",
        });
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe("用户已存在");
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      const mockResponse = { success: true };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      // First login to set authenticated state
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { user: { id: "user-1" }, token: "token" },
          }),
      } as Response);

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/v1/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("whatsapp_user");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
    });

    it("should clear state even if logout API fails", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      // Set authenticated state manually
      act(() => {
        result.current.user = { id: "user-1" } as any;
        result.current.isAuthenticated = true;
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("whatsapp_user");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
    });
  });

  describe("Error Handling", () => {
    it("should clear error when new action is performed", async () => {
      const { result } = renderHook(() => useAuth());

      // First, set an error
      act(() => {
        result.current.error = "Previous error";
      });

      // Then perform a new action
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { user: {}, token: "token" },
          }),
      } as Response);

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("Auto-login on Mount", () => {
    it("should attempt auto-login if token exists", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: null,
        avatar: null,
        status: "online",
        lastSeen: new Date(),
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "access_token") return "existing-token";
        if (key === "whatsapp_user") return JSON.stringify(mockUser);
        return null;
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { user: mockUser },
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/v1/auth/me",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer existing-token",
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should not attempt auto-login if no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => useAuth());

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
