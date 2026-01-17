import { SQSClient as AWSSQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import type { AWSConfig } from '../../types';
import type { SQSSendMessageOptions, SQSReceiveMessageOptions } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * 接收到的消息
 */
export interface ReceivedMessage {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes?: Record<string, string>;
  messageAttributes?: Record<string, string>;
}

/**
 * SQS 客户端封装类
 */
export class SQSClient {
  private client: AWSSQSClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new AWSSQSClient(mergedConfig);
  }

  /**
   * 发送消息到 SQS 队列
   */
  async sendMessage(options: SQSSendMessageOptions): Promise<{ messageId: string }> {
    try {
      const command = new SendMessageCommand({
        QueueUrl: options.queueUrl,
        MessageBody: options.messageBody,
        DelaySeconds: options.delaySeconds,
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
   * 从 SQS 队列接收消息
   */
  async receiveMessage(options: SQSReceiveMessageOptions): Promise<ReceivedMessage[]> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: options.queueUrl,
        MaxNumberOfMessages: options.maxNumberOfMessages || 1,
        WaitTimeSeconds: options.waitTimeSeconds,
        VisibilityTimeout: options.visibilityTimeout,
        MessageAttributeNames: ['All'],
        AttributeNames: ['All'],
      });

      const result = await withRetry(() => this.client.send(command));

      return (result.Messages || []).map((message) => ({
        messageId: message.MessageId || '',
        receiptHandle: message.ReceiptHandle || '',
        body: message.Body || '',
        attributes: message.Attributes,
        messageAttributes: message.MessageAttributes ? Object.entries(message.MessageAttributes).reduce((acc, [key, attr]) => {
          if (attr.StringValue) {
            acc[key] = attr.StringValue;
          }
          return acc;
        }, {} as Record<string, string>) : undefined,
      }));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 从 SQS 队列删除消息
   */
  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 获取 SQS 队列属性
   */
  async getQueueAttributes(
    queueUrl: string,
    attributeNames?: string[]
  ): Promise<Record<string, string>> {
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: attributeNames || ['All'],
      });

      const result = await withRetry(() => this.client.send(command));
      return result.Attributes || {};
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}