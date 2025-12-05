"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthService } from "../../application/services/auth.service";
import type { IAuthService, AuthState } from "../../domain/interfaces/services/auth.service.interface";

export function useAuth() {
  const authService = getAuthService();
  const [authState, setAuthState] = useState<AuthState>(
    authService.getAuthState()
  );

  useEffect(() => {
    const updateState = () => {
      setAuthState(authService.getAuthState());
    };

    // 初始化时更新状态
    updateState();

    // 可以添加事件监听器来响应状态变化
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [authService]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      setAuthState(authService.getAuthState());
      return result;
    },
    [authService]
  );

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const result = await authService.register(data);
      setAuthState(authService.getAuthState());
      return result;
    },
    [authService]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthState(authService.getAuthState());
  }, [authService]);

  const updateUser = useCallback(
    async (updates: {
      username?: string;
      name?: string;
      about?: string;
      status?: string;
      avatar?: string;
    }) => {
      const result = await authService.updateUser(updates);
      setAuthState(authService.getAuthState());
      return result;
    },
    [authService]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await authService.changePassword(
        currentPassword,
        newPassword
      );
      setAuthState(authService.getAuthState());
      return result;
    },
    [authService]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      return await authService.forgotPassword(email);
    },
    [authService]
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      return await authService.resetPassword(token, newPassword);
    },
    [authService]
  );

  const clearError = useCallback(() => {
    authService.clearError();
    setAuthState(authService.getAuthState());
  }, [authService]);

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

