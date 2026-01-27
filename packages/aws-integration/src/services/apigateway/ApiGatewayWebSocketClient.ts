import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
  GetConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import type { AWSConfig } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * API Gateway WebSocket 连接信息
 */
export interface WebSocketConnection {
  connectionId: string;
  userId?: string;
  connectedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * 发送消息到连接的选项
 */
export interface SendToConnectionOptions {
  connectionId: string;
  data: string | Uint8Array | Buffer;
}

/**
 * API Gateway WebSocket 客户端封装类
 */
export class ApiGatewayWebSocketClient {
  private client: ApiGatewayManagementApiClient;
  private endpoint: string;

  constructor(config?: Partial<AWSConfig> & { endpoint: string }) {
    if (!config?.endpoint) {
      throw new Error('API Gateway WebSocket endpoint is required');
    }

    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    
    this.endpoint = config.endpoint;
    this.client = new ApiGatewayManagementApiClient({
      ...mergedConfig,
      endpoint: config.endpoint,
    });
  }

  /**
   * 发送消息到指定连接
   */
  async sendToConnection(options: SendToConnectionOptions): Promise<void> {
    try {
      const command = new PostToConnectionCommand({
        ConnectionId: options.connectionId,
        Data: typeof options.data === 'string' 
          ? new TextEncoder().encode(options.data)
          : options.data,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 发送 JSON 消息到指定连接
   */
  async sendJSONToConnection(connectionId: string, data: Record<string, unknown>): Promise<void> {
    return this.sendToConnection({
      connectionId,
      data: JSON.stringify(data),
    });
  }

  /**
   * 批量发送消息到多个连接
   */
  async sendToConnections(
    connectionIds: string[],
    data: string | Uint8Array | Buffer
  ): Promise<{ succeeded: string[]; failed: Array<{ connectionId: string; error: Error }> }> {
    const results = {
      succeeded: [] as string[],
      failed: [] as Array<{ connectionId: string; error: Error }>,
    };

    await Promise.allSettled(
      connectionIds.map(async (connectionId) => {
        try {
          await this.sendToConnection({ connectionId, data });
          results.succeeded.push(connectionId);
        } catch (error) {
          results.failed.push({
            connectionId,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      })
    );

    return results;
  }

  /**
   * 获取连接信息
   */
  async getConnection(connectionId: string): Promise<WebSocketConnection | null> {
    try {
      const command = new GetConnectionCommand({
        ConnectionId: connectionId,
      });

      const result = await withRetry(() => this.client.send(command)) as any;
      
      return {
        connectionId,
        connectedAt: result.ConnectedAt,
        metadata: result.Identity as Record<string, unknown> | undefined,
      };
    } catch (error) {
      const awsError = normalizeAWSError(error);
      // 如果连接不存在，返回 null
      if (awsError.statusCode === 410 || awsError.code === 'GoneException') {
        return null;
      }
      throw awsError;
    }
  }

  /**
   * 删除连接
   */
  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const command = new DeleteConnectionCommand({
        ConnectionId: connectionId,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      const awsError = normalizeAWSError(error);
      // 如果连接不存在，忽略错误
      if (awsError.statusCode === 410 || awsError.code === 'GoneException') {
        return;
      }
      throw awsError;
    }
  }

  /**
   * 获取 API Gateway WebSocket 端点
   */
  getEndpoint(): string {
    return this.endpoint;
  }
}
