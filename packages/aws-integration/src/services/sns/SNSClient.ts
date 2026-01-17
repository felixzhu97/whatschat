import { SNSClient as AWSSNSClient, PublishCommand, SubscribeCommand, UnsubscribeCommand } from '@aws-sdk/client-sns';
import type { AWSConfig } from '../../types';
import type { SNSPublishOptions, SNSSubscribeOptions } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * SNS 客户端封装类
 */
export class SNSClient {
  private client: AWSSNSClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new AWSSNSClient(mergedConfig);
  }

  /**
   * 发布消息到 SNS 主题
   */
  async publish(options: SNSPublishOptions): Promise<{ messageId: string }> {
    try {
      const command = new PublishCommand({
        TopicArn: options.topicArn,
        TargetArn: options.targetArn,
        Message: options.message,
        Subject: options.subject,
        MessageAttributes: options.attributes ? Object.entries(options.attributes).reduce((acc, [key, value]) => {
          acc[key] = {
            DataType: 'String',
            StringValue: value,
          };
          return acc;
        }, {} as Record<string, { DataType: string; StringValue: string }>) : undefined,
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        messageId: result.MessageId || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 订阅 SNS 主题
   */
  async subscribe(options: SNSSubscribeOptions): Promise<{ subscriptionArn: string }> {
    try {
      const command = new SubscribeCommand({
        TopicArn: options.topicArn,
        Protocol: options.protocol,
        Endpoint: options.endpoint,
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        subscriptionArn: result.SubscriptionArn || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 取消订阅 SNS 主题
   */
  async unsubscribe(subscriptionArn: string): Promise<void> {
    try {
      const command = new UnsubscribeCommand({
        SubscriptionArn: subscriptionArn,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}