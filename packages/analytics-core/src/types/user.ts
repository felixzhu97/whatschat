/**
 * 用户属性类型定义
 */

export interface UserProperties {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface User {
  id: string;
  properties: UserProperties;
  createdAt: number;
  updatedAt: number;
}
