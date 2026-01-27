import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiGatewayWebSocketClient } from '@whatschat/aws-integration';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../../database/redis.service';
import logger from '@/shared/utils/logger';
import type { WebSocketConnection, SendToConnectionOptions } from '@whatschat/aws-integration';

/**
 * API Gateway WebSocket 服务 - 管理 WebSocket 连接和消息
 */
@Injectable()
export class ApiGatewayWebSocketService implements OnModuleInit {
  private wsClient: ApiGatewayWebSocketClient | null = null;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;
  private readonly connectionPrefix = 'ws:connection:';
  private readonly userConnectionPrefix = 'ws:user:';

  constructor(private readonly redis: RedisService) {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    try {
      const endpoint = process.env['AWS_API_GATEWAY_WEBSOCKET_ENDPOINT'];
      
      if (!endpoint) {
        logger.warn('⚠️  AWS API Gateway WebSocket endpoint not configured');
        return;
      }

      const awsConfig: any = {};
      
      if (this.config.storage.aws.accessKeyId && this.config.storage.aws.secretAccessKey) {
        awsConfig.credentials = {
          accessKeyId: this.config.storage.aws.accessKeyId,
          secretAccessKey: this.config.storage.aws.secretAccessKey,
        };
      }

      awsConfig.region = this.config.storage.aws.region || 'us-east-1';
      awsConfig.endpoint = endpoint;

      this.wsClient = new ApiGatewayWebSocketClient(awsConfig);
      logger.info('✅ API Gateway WebSocket Service initialized successfully');
    } catch (error) {
      logger.error('❌ API Gateway WebSocket Service initialization failed:', error);
      // 在开发环境中不抛出错误，允许应用启动
      if (this.config.server.isProduction) {
        throw error;
      }
    }
  }

  /**
   * 检查服务是否可用
   */
  isAvailable(): boolean {
    return this.wsClient !== null;
  }

  /**
   * 存储连接信息
   */
  async storeConnection(connectionId: string, userId: string, metadata?: Record<string, unknown>): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('API Gateway WebSocket service is not available');
    }

    const connection: WebSocketConnection = {
      connectionId,
      userId,
      connectedAt: new Date(),
      ...(metadata && { metadata }),
    };

    // 存储连接信息（RedisService.set() 会自动序列化对象）
    await this.redis.set(
      `${this.connectionPrefix}${connectionId}`,
      connection,
      86400 // 24小时过期（秒）
    );

    // 存储用户到连接的映射
    await this.redis.sadd(`${this.userConnectionPrefix}${userId}`, connectionId);
  }

  /**
   * 获取连接信息
   */
  async getConnection(connectionId: string): Promise<WebSocketConnection | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const data = await this.redis.get<WebSocketConnection>(`${this.connectionPrefix}${connectionId}`);
    if (!data) {
      return null;
    }

    // RedisService.get() already parses JSON
    return data as WebSocketConnection;
  }

  /**
   * 获取用户的所有连接
   */
  async getUserConnections(userId: string): Promise<string[]> {
    const connectionIds = await this.redis.smembers(`${this.userConnectionPrefix}${userId}`);
    
    // 验证连接是否仍然有效
    const validConnections: string[] = [];
    for (const connectionId of connectionIds) {
      const connection = await this.getConnection(connectionId);
      if (connection) {
        validConnections.push(connectionId);
      } else {
        // 清理无效连接
        await this.redis.srem(`${this.userConnectionPrefix}${userId}`, connectionId);
      }
    }

    return validConnections;
  }

  /**
   * 删除连接信息
   */
  async removeConnection(connectionId: string): Promise<void> {
    const connection = await this.getConnection(connectionId);
    
    if (connection?.userId) {
      await this.redis.srem(`${this.userConnectionPrefix}${connection.userId}`, connectionId);
    }

    await this.redis.del(`${this.connectionPrefix}${connectionId}`);
  }

  /**
   * 发送消息到指定连接
   */
  async sendToConnection(options: SendToConnectionOptions): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('API Gateway WebSocket service is not available');
    }

    try {
      await this.wsClient!.sendToConnection(options);
    } catch (error: any) {
      // 如果连接已断开（410），清理连接信息
      if (error.statusCode === 410 || error.code === 'GoneException') {
        await this.removeConnection(options.connectionId);
      }
      throw error;
    }
  }

  /**
   * 发送 JSON 消息到指定连接
   */
  async sendJSONToConnection(connectionId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('API Gateway WebSocket service is not available');
    }

    await this.wsClient!.sendJSONToConnection(connectionId, data);
  }

  /**
   * 发送消息到用户的所有连接
   */
  async sendToUser(userId: string, data: string | Record<string, unknown>): Promise<{
    succeeded: string[];
    failed: Array<{ connectionId: string; error: Error }>;
  }> {
    const connectionIds = await this.getUserConnections(userId);
    
    if (connectionIds.length === 0) {
      return { succeeded: [], failed: [] };
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    const results = await this.wsClient!.sendToConnections(connectionIds, message);

    // 清理失败的连接
    for (const failed of results.failed) {
      await this.removeConnection(failed.connectionId);
    }

    return results;
  }

  /**
   * 广播消息到多个用户
   */
  async broadcastToUsers(
    userIds: string[],
    data: string | Record<string, unknown>
  ): Promise<{
    succeeded: string[];
    failed: Array<{ connectionId: string; error: Error }>;
  }> {
    const allConnectionIds: string[] = [];
    
    for (const userId of userIds) {
      const connectionIds = await this.getUserConnections(userId);
      allConnectionIds.push(...connectionIds);
    }

    if (allConnectionIds.length === 0) {
      return { succeeded: [], failed: [] };
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    const results = await this.wsClient!.sendToConnections(allConnectionIds, message);

    // 清理失败的连接
    for (const failed of results.failed) {
      await this.removeConnection(failed.connectionId);
    }

    return results;
  }

  /**
   * 获取 API Gateway WebSocket 客户端（用于高级操作）
   */
  getWebSocketClient(): ApiGatewayWebSocketClient | null {
    return this.wsClient;
  }
}
