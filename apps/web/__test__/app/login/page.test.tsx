import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from '@/app/login/page'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

vi.mock('../../../hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
}))

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div role="alert" {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isAuthenticated = false
    mockUseAuth.isLoading = false
    mockUseAuth.error = null
  })

  describe('Basic Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />)
      
      expect(screen.getByText('登录 WhatsApp')).toBeInTheDocument()
      expect(screen.getByText('请输入您的邮箱和密码登录')).toBeInTheDocument()
    })

    it('should render form inputs', () => {
      render(<LoginPage />)
      
      expect(screen.getByPlaceholderText('请输入邮箱')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginPage />)
      
      expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    })

    it('should render register link', () => {
      render(<LoginPage />)
      
      expect(screen.getByText('还没有账号？')).toBeInTheDocument()
      expect(screen.getByText('立即注册')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should update email field', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const emailInput = screen.getByPlaceholderText('请输入邮箱')
      await user.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should update password field', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const passwordInput = screen.getByPlaceholderText('请输入密码')
      await user.type(passwordInput, 'password123')
      
      expect(passwordInput).toHaveValue('password123')
    })

    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      const passwordInput = screen.getByPlaceholderText('请输入密码')
      const toggleButton = screen.getByTestId('eye-icon').closest('button')
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      if (toggleButton) {
        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Form Validation', () => {
    it('should have required fields', () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByPlaceholderText('请输入邮箱')
      const passwordInput = screen.getByPlaceholderText('请输入密码')
      
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('should have correct input types', () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByPlaceholderText('请输入邮箱')
      const passwordInput = screen.getByPlaceholderText('请输入密码')
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Loading States', () => {
    it('should show loading state', () => {
      mockUseAuth.isLoading = true
      render(<LoginPage />)
      
      const submitButton = screen.getByRole('button', { name: '登录中...' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message', () => {
      mockUseAuth.error = '登录失败，请检查邮箱和密码'
      render(<LoginPage />)
      
      expect(screen.getByText('登录失败，请检查邮箱和密码')).toBeInTheDocument()
    })
  })

  describe('Icons and Styling', () => {
    it('should render icons', () => {
      render(<LoginPage />)
      
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    })

    it('should have proper form structure', () => {
      render(<LoginPage />)
      
      const form = screen.getByRole('button', { name: '登录' }).closest('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(<LoginPage />)
      
      expect(screen.getByText('邮箱')).toBeInTheDocument()
      expect(screen.getByText('密码')).toBeInTheDocument()
    })

    it('should have proper input IDs', () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByPlaceholderText('请输入邮箱')
      const passwordInput = screen.getByPlaceholderText('请输入密码')
      
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('should have proper button types', () => {
      render(<LoginPage />)
      
      const submitButton = screen.getByRole('button', { name: '登录' })
      const toggleButton = screen.getByTestId('eye-icon').closest('button')
      const registerButton = screen.getByText('立即注册')
      
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(toggleButton).toHaveAttribute('type', 'button')
      expect(registerButton).toHaveAttribute('type', 'button')
    })
  })
})