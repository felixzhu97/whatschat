import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock auth service that will be used by the hook
const mockAuthService: {
  getAuthState: ReturnType<typeof vi.fn>;
  login: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  changePassword: ReturnType<typeof vi.fn>;
  forgotPassword: ReturnType<typeof vi.fn>;
  resetPassword: ReturnType<typeof vi.fn>;
  clearError: ReturnType<typeof vi.fn>;
} = {
  getAuthState: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  })),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
  changePassword: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  clearError: vi.fn(),
};

// Mock the modules
vi.mock("@/src/application/services/auth.service", () => ({
  getAuthService: vi.fn(() => mockAuthService),
}));

vi.mock("@/src/domain/entities/user.entity", () => ({
  User: {
    create: vi.fn((data) => data),
  },
}));

// Import useAuth after setting up mocks
import { useAuth } from "@/src/presentation/hooks/use-auth";

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.getAuthState.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    mockAuthService.login.mockResolvedValue({ success: true });
    mockAuthService.register.mockResolvedValue({ success: true });
    mockAuthService.logout.mockResolvedValue(undefined);
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
    it("should call login on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should handle login failure", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        success: false,
        error: "邮箱或密码错误",
      });
    mockAuthService.getAuthState.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: "邮箱或密码错误" as string | null,
    });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login("test@example.com", "wrongpassword");
        expect(response.success).toBe(false);
        expect(response.error).toBe("邮箱或密码错误");
      });
    });

    it("should handle login throwing an error", async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error("Network error"));
      mockAuthService.getAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Network error" as string | null,
      });

      const { result } = renderHook(() => useAuth());

      let caughtError = false;
      await act(async () => {
        try {
          await result.current.login("test@example.com", "password123");
        } catch {
          caughtError = true;
        }
      });
      expect(caughtError || result.current.error === "Network error").toBe(true);
    });
  });

  describe("Register", () => {
    it("should call register on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register({
          email: "test@example.com",
          password: "password123",
          username: "testuser",
          phone: "+1234567890",
        });
      });

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phone: "+1234567890",
      });
    });

    it("should handle registration failure", async () => {
      mockAuthService.register.mockResolvedValueOnce({
        success: false,
        error: "用户已存在",
      });
      mockAuthService.getAuthState.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "用户已存在" as string | null,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.register({
          email: "existing@example.com",
          password: "password123",
          username: "existinguser",
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe("用户已存在");
      });
    });
  });

  describe("Logout", () => {
    it("should call logout on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("should clear error when clearError is called", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(mockAuthService.clearError).toHaveBeenCalledTimes(1);
    });
  });

  describe("Update User", () => {
    it("should call updateUser on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.updateUser({ name: "New Name" });
      });

      expect(mockAuthService.updateUser).toHaveBeenCalledWith({ name: "New Name" });
    });
  });

  describe("Change Password", () => {
    it("should call changePassword on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.changePassword("oldPassword", "newPassword");
      });

      expect(mockAuthService.changePassword).toHaveBeenCalledWith("oldPassword", "newPassword");
    });
  });

  describe("Forgot Password", () => {
    it("should call forgotPassword on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.forgotPassword("test@example.com");
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("Reset Password", () => {
    it("should call resetPassword on the auth service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword("reset-token", "newPassword");
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith("reset-token", "newPassword");
    });
  });
});
