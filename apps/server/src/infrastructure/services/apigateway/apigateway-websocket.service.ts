import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiGatewayWebSocketClient } from '@whatschat/aws-integration';
import { ConfigService } from '../../config/config.service';
import { RedisService } from '../../database/redis.service';
import logger from '@/shared/utils/logger';
import type { WebSocketConnection, SendToConnectionOptions } from '@whatschat/aws-integration';

/**
 * API Gateway WebSocket service - manage WebSocket connections and messages
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
      // Do not throw in development so that the app can still start
      if (this.config.server.isProduction) {
        throw error;
      }
    }
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.wsClient !== null;
  }

  /**
   * Store connection information
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

    // Store connection info (RedisService.set() will automatically serialize objects)
    await this.redis.set(
      `${this.connectionPrefix}${connectionId}`,
      connection,
      86400 // 24小时过期（秒）
    );

    // Store user-to-connection mapping
    await this.redis.sadd(`${this.userConnectionPrefix}${userId}`, connectionId);
  }

  /**
   * Get connection information
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
   * Get all connections of a user
   */
  async getUserConnections(userId: string): Promise<string[]> {
    const connectionIds = await this.redis.smembers(`${this.userConnectionPrefix}${userId}`);
    
    // Validate that connections are still active
    const validConnections: string[] = [];
    for (const connectionId of connectionIds) {
      const connection = await this.getConnection(connectionId);
      if (connection) {
        validConnections.push(connectionId);
      } else {
        // Clean up invalid connections
        await this.redis.srem(`${this.userConnectionPrefix}${userId}`, connectionId);
      }
    }

    return validConnections;
  }

  /**
   * Remove connection information
   */
  async removeConnection(connectionId: string): Promise<void> {
    const connection = await this.getConnection(connectionId);
    
    if (connection?.userId) {
      await this.redis.srem(`${this.userConnectionPrefix}${connection.userId}`, connectionId);
    }

    await this.redis.del(`${this.connectionPrefix}${connectionId}`);
  }

  /**
   * Send a message to a specific connection
   */
  async sendToConnection(options: SendToConnectionOptions): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('API Gateway WebSocket service is not available');
    }

    try {
      await this.wsClient!.sendToConnection(options);
    } catch (error: any) {
      // If the connection is already closed (410), clean up connection information
      if (error.statusCode === 410 || error.code === 'GoneException') {
        await this.removeConnection(options.connectionId);
      }
      throw error;
    }
  }

  /**
   * Send a JSON message to a specific connection
   */
  async sendJSONToConnection(connectionId: string, data: Record<string, unknown>): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('API Gateway WebSocket service is not available');
    }

    await this.wsClient!.sendJSONToConnection(connectionId, data);
  }

  /**
   * Send a message to all active connections of a given user
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

    // Clean up failed connections
    for (const failed of results.failed) {
      await this.removeConnection(failed.connectionId);
    }

    return results;
  }

  /**
   * Broadcast a message to multiple users
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

    // Clean up failed connections
    for (const failed of results.failed) {
      await this.removeConnection(failed.connectionId);
    }

    return results;
  }

  /**
   * Get the underlying API Gateway WebSocket client (for advanced operations)
   */
  getWebSocketClient(): ApiGatewayWebSocketClient | null {
    return this.wsClient;
  }
}
