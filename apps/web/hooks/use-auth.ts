"use client";

import { useState, useCallback, useEffect } from "react";
import { authApi, apiClient } from "@/lib/api";

// 定义认证状态类型
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 定义用户类型（与后端保持一致）
interface User {
  id: string;
  username: string;
  name?: string;
  about?: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: string | Date;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEYS = {
  USER: "whatsapp_user",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // 初始化时检查本地存储和验证token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (savedUser && accessToken) {
          // 设置API客户端的token
          apiClient.setToken(accessToken);

          try {
            // 验证token是否有效
            const response: any = await authApi.getCurrentUser();
            if (response.success && response.data) {
              setAuthState({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return;
            }
          } catch (error) {
            // token无效，尝试刷新
            if (refreshToken) {
              try {
                const refreshResponse: any =
                  await authApi.refreshToken(refreshToken);
                if (refreshResponse.success && refreshResponse.data) {
                  const { user, tokens } = refreshResponse.data;

                  // 更新存储的token和用户信息
                  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
                  localStorage.setItem(
                    STORAGE_KEYS.ACCESS_TOKEN,
                    tokens.accessToken
                  );
                  localStorage.setItem(
                    STORAGE_KEYS.REFRESH_TOKEN,
                    tokens.refreshToken
                  );

                  // 设置API客户端的新token
                  apiClient.setToken(tokens.accessToken);

                  setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });
                  return;
                }
              } catch (refreshError) {
                console.error("Token刷新失败:", refreshError);
              }
            }
          }
        }

        // 清除无效的认证信息
        clearAuthStorage();
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error("认证初始化失败:", error);
        clearAuthStorage();
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // 清除认证存储
  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    apiClient.setToken(null);
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response: any = await authApi.login({ email, password });

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // 保存到本地存储
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

        // 设置API客户端的token
        apiClient.setToken(tokens.accessToken);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        throw new Error(response.message || "登录失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "登录失败，请检查邮箱和密码";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // 注册
  type RegisterParams = {
    username: string;
    email: string;
    phone?: string;
    password: string;
  };
  const register = useCallback(
    async (
      nameOrParams: string | RegisterParams,
      email?: string,
      phone?: string,
      password?: string
    ) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const payload: RegisterParams =
          typeof nameOrParams === "string"
            ? {
                username: nameOrParams,
                email: email || "",
                phone,
                password: password || "",
              }
            : nameOrParams;
        const response: any = await authApi.register(payload);

        if (response.success && response.data) {
          const { user, tokens } = response.data;

          // 保存到本地存储
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

          // 设置API客户端的token
          apiClient.setToken(tokens.accessToken);

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } else {
          throw new Error(response.message || "注册失败");
        }
      } catch (error: any) {
        const errorMessage = error.message || "注册失败，请稍后重试";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // 登出
  const logout = useCallback(async () => {
    try {
      // 调用后端登出API
      await authApi.logout();
    } catch (error) {
      console.error("登出API调用失败:", error);
    } finally {
      // 无论API调用是否成功，都清除本地认证信息
      clearAuthStorage();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [clearAuthStorage]);

  // 更新用户信息
  const updateUser = useCallback(
    async (updates: {
      username?: string;
      name?: string;
      about?: string;
      status?: string;
      avatar?: string;
    }) => {
      if (!authState.user) return { success: false, error: "用户未登录" };

      try {
        const response: any = await authApi.updateProfile(updates);

        if (response.success && response.data) {
          const updatedUser = response.data.user;

          // 更新本地存储
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

          setAuthState((prev) => ({
            ...prev,
            user: updatedUser,
          }));

          return { success: true };
        } else {
          throw new Error(response.message || "更新失败");
        }
      } catch (error: any) {
        const errorMessage = error.message || "更新用户信息失败";
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [authState.user]
  );

  // 修改密码
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!authState.user) return { success: false, error: "用户未登录" };

      try {
        const response = await authApi.changePassword({
          currentPassword,
          newPassword,
        });

        if (response.success) {
          // 密码修改成功后，清除认证信息，要求重新登录
          clearAuthStorage();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          return { success: true, message: "密码修改成功，请重新登录" };
        } else {
          throw new Error(response.message || "密码修改失败");
        }
      } catch (error: any) {
        const errorMessage = error.message || "密码修改失败";
        return { success: false, error: errorMessage };
      }
    },
    [authState.user, clearAuthStorage]
  );

  // 忘记密码
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await authApi.forgotPassword(email);

      if (response.success) {
        return {
          success: true,
          message: response.message || "重置链接已发送到邮箱",
        };
      } else {
        throw new Error(response.message || "发送重置链接失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "发送重置链接失败";
      return { success: false, error: errorMessage };
    }
  }, []);

  // 重置密码
  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        const response = await authApi.resetPassword({ token, newPassword });

        if (response.success) {
          return { success: true, message: response.message || "密码重置成功" };
        } else {
          throw new Error(response.message || "密码重置失败");
        }
      } catch (error: any) {
        const errorMessage = error.message || "密码重置失败";
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // 清除错误
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
  };
}
