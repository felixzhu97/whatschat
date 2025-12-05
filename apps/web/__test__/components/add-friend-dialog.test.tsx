import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AddFriendDialog } from '@/src/presentation/components/add-friend-dialog'

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input onChange={onChange} onKeyDown={onKeyDown} {...props} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, ...props }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-testid={`tab-${value}`} {...props}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid={`tab-content-${value}`} {...props}>
      {children}
    </div>
  ),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  Search: () => <div data-testid="search-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
  QrCode: () => <div data-testid="qr-code-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
}))

describe('AddFriendDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAddFriend: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('添加好友')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<AddFriendDialog {...mockProps} isOpen={false} />)

      expect(screen.queryByText('添加好友')).not.toBeInTheDocument()
    })

    it('should render search input', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByPlaceholderText('输入手机号或用户名')).toBeInTheDocument()
    })

    it('should render message textarea', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByPlaceholderText('输入验证消息')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<AddFriendDialog {...mockProps} />)

      const closeButton = screen.getByTestId('x-icon').closest('button')
      if (closeButton) {
        await user.click(closeButton)
        expect(mockProps.onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should update search input value', async () => {
      const user = userEvent.setup()
      render(<AddFriendDialog {...mockProps} />)

      const searchInput = screen.getByPlaceholderText('输入手机号或用户名')
      await user.type(searchInput, 'test user')

      expect(searchInput).toHaveValue('test user')
    })

    it('should update message textarea value', async () => {
      const user = userEvent.setup()
      render(<AddFriendDialog {...mockProps} />)

      const messageTextarea = screen.getByPlaceholderText('输入验证消息')
      await user.clear(messageTextarea)
      await user.type(messageTextarea, 'Hello, friend!')

      expect(messageTextarea).toHaveValue('Hello, friend!')
    })
  })

  describe('Tab Navigation', () => {
    it('should render all tab triggers', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByTestId('tab-search')).toBeInTheDocument()
      expect(screen.getByTestId('tab-nearby')).toBeInTheDocument()
      expect(screen.getByTestId('tab-recent')).toBeInTheDocument()
      expect(screen.getByTestId('tab-qr')).toBeInTheDocument()
    })

    it('should render tab content areas', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByTestId('tab-content-search')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-nearby')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-recent')).toBeInTheDocument()
      expect(screen.getByTestId('tab-content-qr')).toBeInTheDocument()
    })
  })

  describe('Mock Data Display', () => {
    it('should show nearby users', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('张三')).toBeInTheDocument()
      expect(screen.getByText('李四')).toBeInTheDocument()
      expect(screen.getByText('距离 50米')).toBeInTheDocument()
      expect(screen.getByText('距离 120米')).toBeInTheDocument()
    })

    it('should show recent contacts', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('赵五')).toBeInTheDocument()
      expect(screen.getByText('钱六')).toBeInTheDocument()
      expect(screen.getByText('最后联系：2天前')).toBeInTheDocument()
      expect(screen.getByText('最后联系：1周前')).toBeInTheDocument()
    })

    it('should show QR code section', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('我的二维码')).toBeInTheDocument()
      expect(screen.getByText('扫描二维码')).toBeInTheDocument()
    })
  })

  describe('Form Elements', () => {
    it('should have proper labels', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('搜索用户')).toBeInTheDocument()
      expect(screen.getByText('添加好友消息')).toBeInTheDocument()
    })

    it('should show character count', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByText('10/100')).toBeInTheDocument()
    })

    it('should have proper input attributes', () => {
      render(<AddFriendDialog {...mockProps} />)

      const searchInput = screen.getByPlaceholderText('输入手机号或用户名')
      const messageTextarea = screen.getByPlaceholderText('输入验证消息')

      expect(searchInput).toHaveAttribute('id', 'search')
      expect(messageTextarea).toHaveAttribute('id', 'message')
      expect(messageTextarea).toHaveAttribute('maxLength', '100')
    })
  })

  describe('Icons', () => {
    it('should render all required icons', () => {
      render(<AddFriendDialog {...mockProps} />)

      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
      expect(screen.getAllByTestId('search-icon')).toHaveLength(2) // Tab and content
      expect(screen.getAllByTestId('user-plus-icon')).toHaveLength(4) // All add buttons
      expect(screen.getAllByTestId('qr-code-icon')).toHaveLength(3) // Tab, QR display, and scan button
      expect(screen.getAllByTestId('map-pin-icon')).toHaveLength(4) // Tab, nearby loading, and 2 nearby users
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(3) // Tab and recent contacts
    })
  })
})
