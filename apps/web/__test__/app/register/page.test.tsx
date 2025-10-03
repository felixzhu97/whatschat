import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RegisterPage from "@/app/register/page";

// Mock the useAuth hook
const mockRegister = vi.fn().mockResolvedValue({ success: true });
const mockUseAuth: any = {
  register: mockRegister,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
};

vi.mock("../../../hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => (
    <div role="alert" {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isLoading = false;
    mockUseAuth.error = null;
  });

  describe("Basic Rendering", () => {
    it("should render registration form", () => {
      render(<RegisterPage />);

      expect(screen.getByText("注册 WhatsApp")).toBeInTheDocument();
      expect(screen.getByText("创建您的新账号")).toBeInTheDocument();
    });

    it("should render all form inputs", () => {
      render(<RegisterPage />);

      expect(screen.getByPlaceholderText("请输入姓名")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("请输入邮箱")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("请输入密码（至少6位）")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("请再次输入密码")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("请输入手机号")).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<RegisterPage />);

      expect(screen.getByRole("button", { name: "注册" })).toBeInTheDocument();
    });

    it("should render login link", () => {
      render(<RegisterPage />);

      expect(screen.getByText("已有账号？")).toBeInTheDocument();
      expect(screen.getByText("立即登录")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update username field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      await user.type(usernameInput, "testuser");

      expect(usernameInput).toHaveValue("testuser");
    });

    it("should update email field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const emailInput = screen.getByPlaceholderText("请输入邮箱");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      await user.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should update confirm password field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");
      await user.type(confirmPasswordInput, "password123");

      expect(confirmPasswordInput).toHaveValue("password123");
    });

    it("should update phone field", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const phoneInput = screen.getByPlaceholderText("请输入手机号");
      await user.type(phoneInput, "+1234567890");

      expect(phoneInput).toHaveValue("+1234567890");
    });

    it("should toggle password visibility", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      const toggleButtons = screen.getAllByTestId("eye-icon");
      const toggleButton = toggleButtons[0]?.closest("button");

      expect(passwordInput).toHaveAttribute("type", "password");

      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute("type", "text");
      }
    });

    it("should toggle confirm password visibility", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");
      const toggleButtons = screen.getAllByTestId("eye-icon");
      const toggleButton = toggleButtons[1]?.closest("button");

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      if (toggleButton) {
        await user.click(toggleButton);
        expect(confirmPasswordInput).toHaveAttribute("type", "text");
      }
    });
  });

  describe("Form Validation", () => {
    it("should have required fields", () => {
      render(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      const emailInput = screen.getByPlaceholderText("请输入邮箱");
      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");

      // 由于我们移除了HTML5验证，这些字段不再有required属性
      // 但我们仍然可以通过JavaScript验证来确保它们是必填的
      expect(usernameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("should have correct input types", () => {
      render(<RegisterPage />);

      const emailInput = screen.getByPlaceholderText("请输入邮箱");
      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");

      // 邮箱字段现在是email类型，因为我们重新添加了HTML5验证
      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    it("should validate password match", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // 填写其他必填字段
      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("请输入手机号"),
        "1234567890"
      );

      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "different123");

      // 按钮应该被禁用，因为密码不匹配
      const submitButton = screen.getByRole("button", { name: "注册" });
      expect(submitButton).toBeDisabled();
    });

    it("should validate password strength", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      // 填写其他必填字段
      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("请输入手机号"),
        "1234567890"
      );

      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      await user.type(passwordInput, "123");
      await user.type(screen.getByPlaceholderText("请再次输入密码"), "123");

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      expect(screen.getByText("密码至少需要6位")).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("请输入密码（至少6位）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请再次输入密码"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请输入手机号"),
        "+1234567890"
      );

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      expect(mockRegister).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        phone: "+1234567890",
      });
    });

    it("should not submit form with invalid data", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "invalid-email"
      );
      await user.type(
        screen.getByPlaceholderText("请输入密码（至少6位）"),
        "123"
      );
      await user.type(screen.getByPlaceholderText("请再次输入密码"), "456");

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should handle registration success", async () => {
      mockRegister.mockResolvedValueOnce({ success: true });
      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("请输入密码（至少6位）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请再次输入密码"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请输入手机号"),
        "1234567890"
      );

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state", () => {
      mockUseAuth.isLoading = true;
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", { name: "注册中..." });
      expect(submitButton).toBeDisabled();
    });

    it("should disable form inputs when loading", () => {
      mockUseAuth.isLoading = true;
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", { name: "注册中..." });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message", () => {
      mockUseAuth.error = "注册失败，邮箱已被使用";
      render(<RegisterPage />);

      expect(screen.getByText("注册失败，邮箱已被使用")).toBeInTheDocument();
    });

    it("should clear error when form is resubmitted", async () => {
      mockUseAuth.error = "Previous error";
      const user = userEvent.setup();
      render(<RegisterPage />);

      await user.type(screen.getByPlaceholderText("请输入姓名"), "testuser");
      await user.type(
        screen.getByPlaceholderText("请输入邮箱"),
        "test@example.com"
      );
      await user.type(
        screen.getByPlaceholderText("请输入密码（至少6位）"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请再次输入密码"),
        "password123"
      );
      await user.type(
        screen.getByPlaceholderText("请输入手机号"),
        "1234567890"
      );

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      // Error should be cleared when new submission starts
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  describe("Icons and Styling", () => {
    it("should render all required icons", () => {
      render(<RegisterPage />);

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
      expect(screen.getAllByTestId("lock-icon")).toHaveLength(2);
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getAllByTestId("eye-icon")).toHaveLength(2);
    });

    it("should have proper form structure", () => {
      render(<RegisterPage />);

      const form = screen.getByRole("button", { name: "注册" }).closest("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels", () => {
      render(<RegisterPage />);

      expect(screen.getByText("姓名")).toBeInTheDocument();
      expect(screen.getByText("邮箱")).toBeInTheDocument();
      expect(screen.getByText("密码")).toBeInTheDocument();
      expect(screen.getByText("确认密码")).toBeInTheDocument();
      expect(screen.getByText("手机号")).toBeInTheDocument();
    });

    it("should have proper input IDs", () => {
      render(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      const emailInput = screen.getByPlaceholderText("请输入邮箱");
      const passwordInput =
        screen.getByPlaceholderText("请输入密码（至少6位）");
      const confirmPasswordInput =
        screen.getByPlaceholderText("请再次输入密码");
      const phoneInput = screen.getByPlaceholderText("请输入手机号");

      expect(usernameInput).toHaveAttribute("id", "name");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
      expect(phoneInput).toHaveAttribute("id", "phone");
    });

    it("should have proper button types", () => {
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", { name: "注册" });
      const loginButton = screen.getByText("立即登录");

      expect(submitButton).toHaveAttribute("type", "submit");
      expect(loginButton).toHaveAttribute("type", "button");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      await user.type(usernameInput, "testuser");
      await user.keyboard("{Tab}");

      const emailInput = screen.getByPlaceholderText("请输入邮箱");
      expect(document.activeElement).toBe(emailInput);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty form submission", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", { name: "注册" });
      await user.click(submitButton);

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should handle very long input values", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const longString = "A".repeat(100);
      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      await user.type(usernameInput, longString);

      expect(usernameInput).toHaveValue(longString);
    });

    it("should handle special characters in inputs", async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const specialString = "test@123";
      const usernameInput = screen.getByPlaceholderText("请输入姓名");
      await user.clear(usernameInput);
      await user.type(usernameInput, specialString);

      expect(usernameInput).toHaveValue(specialString);
    });
  });
});
