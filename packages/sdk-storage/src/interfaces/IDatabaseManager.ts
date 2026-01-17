import { CallHistory, UserSettings, Recording, DatabaseStats } from "../types";

/**
 * 数据库管理器接口
 */
export interface IDatabaseManager {
  /**
   * 初始化数据库
   */
  initialize(): Promise<void>;

  /**
   * 关闭数据库
   */
  close(): Promise<void>;

  /**
   * 保存通话记录
   */
  saveCallRecord(record: Omit<CallHistory, "id" | "createdAt">): Promise<CallHistory>;

  /**
   * 获取通话记录
   */
  getCallRecord(id: string): Promise<CallHistory | null>;

  /**
   * 获取通话记录列表
   */
  getCallHistory(limit?: number, offset?: number): Promise<CallHistory[]>;

  /**
   * 删除通话记录
   */
  deleteCallRecord(id: string): Promise<void>;

  /**
   * 更新通话记录
   */
  updateCallRecord(id: string, updates: Partial<CallHistory>): Promise<void>;

  /**
   * 获取用户设置
   */
  getUserSettings(): Promise<UserSettings | null>;

  /**
   * 更新用户设置
   */
  updateUserSettings(settings: Partial<Omit<UserSettings, "id" | "createdAt" | "updatedAt">>): Promise<UserSettings>;

  /**
   * 保存录制文件索引
   */
  saveRecording(recording: Omit<Recording, "id" | "createdAt">): Promise<Recording>;

  /**
   * 获取录制文件
   */
  getRecording(id: string): Promise<Recording | null>;

  /**
   * 获取录制文件列表
   */
  getRecordings(limit?: number, offset?: number): Promise<Recording[]>;

  /**
   * 删除录制文件索引
   */
  deleteRecording(id: string): Promise<void>;

  /**
   * 获取数据库统计信息
   */
  getStats(): Promise<DatabaseStats>;

  /**
   * 清除所有数据
   */
  clearAll(): Promise<void>;
}
