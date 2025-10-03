import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "@/hooks/use-auth";

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

      expect(fetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
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
      expect(result.current.error).toBe("登录失败，请检查网络连接");
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

      expect(fetch).toHaveBeenCalledWith("/api/auth/register", {
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
      });

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

      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
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
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("Token Refresh", () => {
    it("should refresh token successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: null,
        avatar: null,
        status: "online",
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: "new-jwt-token",
        },
      };

      localStorageMock.getItem.mockReturnValue("old-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: "old-token",
        }),
      });

      expect(result.current.user).toEqual(mockUser);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "new-jwt-token"
      );
    });

    it("should handle refresh token failure", async () => {
      localStorageMock.getItem.mockReturnValue("invalid-token");

      const mockResponse = {
        success: false,
        message: "刷新令牌无效",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("Get Current User", () => {
    it("should get current user successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
        lastSeen: new Date(),
      };

      localStorageMock.getItem.mockReturnValue("valid-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockUser,
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer valid-token",
        },
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle get current user failure", async () => {
      localStorageMock.getItem.mockReturnValue("invalid-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            success: false,
            message: "认证令牌无效",
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.getCurrentUser();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("Update Profile", () => {
    it("should update profile successfully", async () => {
      const updatedUser = {
        id: "user-1",
        email: "test@example.com",
        username: "newusername",
        phone: "+1234567890",
        avatar: "new-avatar.jpg",
        status: "online",
        lastSeen: new Date(),
      };

      localStorageMock.getItem.mockReturnValue("valid-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: updatedUser,
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateProfile({
          username: "newusername",
          phone: "+1234567890",
          avatar: "new-avatar.jpg",
        });
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/profile", {
        method: "PUT",
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newusername",
          phone: "+1234567890",
          avatar: "new-avatar.jpg",
        }),
      });

      expect(result.current.user).toEqual(updatedUser);
    });
  });

  describe("Change Password", () => {
    it("should change password successfully", async () => {
      localStorageMock.getItem.mockReturnValue("valid-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: "密码修改成功",
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.changePassword("oldpassword", "newpassword");
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "oldpassword",
          newPassword: "newpassword",
        }),
      });

      expect(result.current.error).toBeNull();
    });

    it("should handle change password failure", async () => {
      localStorageMock.getItem.mockReturnValue("valid-token");

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            message: "当前密码不正确",
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.changePassword("wrongpassword", "newpassword");
      });

      expect(result.current.error).toBe("当前密码不正确");
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
      localStorageMock.getItem.mockReturnValue("existing-token");

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: null,
        avatar: null,
        status: "online",
        lastSeen: new Date(),
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockUser,
          }),
      } as Response);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      expect(fetch).toHaveBeenCalledWith("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: "Bearer existing-token",
        },
      });
    });

    it("should not attempt auto-login if no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => useAuth());

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
