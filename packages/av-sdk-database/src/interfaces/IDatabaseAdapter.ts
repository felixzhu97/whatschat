/**
 * 数据库适配器接口
 */
export interface IDatabaseAdapter {
  /**
   * 初始化数据库
   */
  initialize(): Promise<void>;

  /**
   * 关闭数据库
   */
  close(): Promise<void>;

  /**
   * 执行查询
   */
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * 执行更新
   */
  execute(sql: string, params?: unknown[]): Promise<number>;

  /**
   * 开始事务
   */
  beginTransaction(): Promise<void>;

  /**
   * 提交事务
   */
  commit(): Promise<void>;

  /**
   * 回滚事务
   */
  rollback(): Promise<void>;

  /**
   * 检查表是否存在
   */
  tableExists(tableName: string): Promise<boolean>;

  /**
   * 创建表
   */
  createTable(sql: string): Promise<void>;
}
