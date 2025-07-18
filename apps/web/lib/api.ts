import { ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API客户端类
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // 从localStorage获取token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
  }

  // 设置认证token
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token)
      } else {
        localStorage.removeItem('access_token')
      }
    }
  }

  // 获取认证token
  getToken(): string | null {
    return this.token
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // 添加认证头
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API请求错误:', error)
      throw error
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // 文件上传
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {},
    }

    // 添加认证头
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('文件上传错误:', error)
      throw error
    }
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL)

// 认证相关API
export const authApi = {
  // 用户注册
  register: async (userData: {
    username: string
    email: string
    password: string
    phone?: string
  }) => {
    return apiClient.post('/auth/register', userData)
  },

  // 用户登录
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login', credentials)
  },

  // 刷新token
  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh-token', { refreshToken })
  },

  // 用户登出
  logout: async () => {
    return apiClient.post('/auth/logout')
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return apiClient.get('/auth/me')
  },

  // 更新用户资料
  updateProfile: async (profileData: {
    username?: string
    status?: string
    avatar?: string
  }) => {
    return apiClient.put('/auth/profile', profileData)
  },

  // 修改密码
  changePassword: async (passwordData: {
    currentPassword: string
    newPassword: string
  }) => {
    return apiClient.put('/auth/change-password', passwordData)
  },

  // 忘记密码
  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword: async (resetData: { token: string; newPassword: string }) => {
    return apiClient.post('/auth/reset-password', resetData)
  },
}

// 用户相关API
export const userApi = {
  // 获取用户列表
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    
    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(endpoint)
  },

  // 获取用户详情
  getUserById: async (userId: string) => {
    return apiClient.get(`/users/${userId}`)
  },

  // 搜索用户
  searchUsers: async (query: string) => {
    return apiClient.get(`/users/search?q=${encodeURIComponent(query)}`)
  },
}

// 聊天相关API
export const chatApi = {
  // 获取聊天列表
  getChats: async () => {
    return apiClient.get('/chats')
  },

  // 获取聊天详情
  getChatById: async (chatId: string) => {
    return apiClient.get(`/chats/${chatId}`)
  },

  // 创建聊天
  createChat: async (chatData: { participantIds: string[]; type: 'private' | 'group'; name?: string }) => {
    return apiClient.post('/chats', chatData)
  },

  // 获取聊天消息
  getChatMessages: async (chatId: string, params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const endpoint = `/chats/${chatId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiClient.get(endpoint)
  },

  // 发送消息
  sendMessage: async (chatId: string, messageData: {
    content: string
    type?: 'text' | 'image' | 'video' | 'audio' | 'file'
    replyToMessageId?: string
  }) => {
    return apiClient.post(`/chats/${chatId}/messages`, messageData)
  },

  // 标记消息为已读
  markMessageAsRead: async (chatId: string, messageId: string) => {
    return apiClient.post(`/chats/${chatId}/messages/${messageId}/read`)
  },
}

// 文件上传API
export const fileApi = {
  // 上传文件
  uploadFile: async (file: File, type: 'avatar' | 'message' | 'status') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return apiClient.upload('/files/upload', formData)
  },

  // 删除文件
  deleteFile: async (fileId: string) => {
    return apiClient.delete(`/files/${fileId}`)
  },
}

export default apiClient