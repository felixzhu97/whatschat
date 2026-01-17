import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { AWSConfig } from '../../types';
import type { LambdaInvokeOptions } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * Lambda 调用结果
 */
export interface LambdaInvokeResult {
  statusCode?: number;
  payload?: string;
  functionError?: string;
  requestId?: string;
}

/**
 * Lambda 客户端封装类
 */
export class LambdaClient {
  private client: AWSLambdaClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new AWSLambdaClient(mergedConfig);
  }

  /**
   * 调用 Lambda 函数（同步）
   */
  async invoke(options: LambdaInvokeOptions): Promise<LambdaInvokeResult> {
    try {
      const payload = typeof options.payload === 'string' 
        ? options.payload 
        : JSON.stringify(options.payload || {});

      const command = new InvokeCommand({
        FunctionName: options.functionName,
        Payload: new TextEncoder().encode(payload),
        InvocationType: options.invocationType || 'RequestResponse',
      });

      const result = await withRetry(() => this.client.send(command));

      let payloadString: string | undefined;
      if (result.Payload) {
        const decoder = new TextDecoder();
        payloadString = decoder.decode(result.Payload);
      }

      return {
        statusCode: result.StatusCode,
        payload: payloadString,
        functionError: result.FunctionError,
        requestId: result.$metadata.requestId,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 异步调用 Lambda 函数
   */
  async invokeAsync(
    functionName: string,
    payload?: Record<string, unknown> | string
  ): Promise<{ requestId?: string }> {
    try {
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload || {});

      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(payloadString),
        InvocationType: 'Event',
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        requestId: result.$metadata.requestId,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}