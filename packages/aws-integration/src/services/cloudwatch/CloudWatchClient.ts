import {
  CloudWatchClient as AWSCloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
} from '@aws-sdk/client-cloudwatch';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  DescribeLogStreamsCommand,
  CreateLogStreamCommand,
  FilterLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import type { AWSConfig } from '../../types';
import type {
  CloudWatchPutMetricOptions,
  CloudWatchPutLogsOptions,
  CloudWatchGetLogsOptions,
  CloudWatchCreateAlarmOptions,
} from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * CloudWatch 日志事件
 */
export interface CloudWatchLogEvent {
  message: string;
  timestamp: number;
  logStreamName?: string;
}

/**
 * CloudWatch 客户端封装类
 */
export class CloudWatchClient {
  private metricsClient: AWSCloudWatchClient;
  private logsClient: CloudWatchLogsClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.metricsClient = new AWSCloudWatchClient(mergedConfig);
    this.logsClient = new CloudWatchLogsClient(mergedConfig);
  }

  /**
   * 发送指标数据到 CloudWatch
   */
  async putMetric(options: CloudWatchPutMetricOptions): Promise<void> {
    try {
      const dimensions = options.dimensions
        ? Object.entries(options.dimensions).map(([Name, Value]) => ({
            Name,
            Value,
          }))
        : undefined;

      const command = new PutMetricDataCommand({
        Namespace: options.namespace,
        MetricData: [
          {
            MetricName: options.metricName,
            Value: options.value,
            Unit: options.unit as StandardUnit | undefined,
            Dimensions: dimensions,
            Timestamp: options.timestamp,
          },
        ],
      });

      await withRetry(() => this.metricsClient.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 写入日志到 CloudWatch Logs
   */
  async putLogs(options: CloudWatchPutLogsOptions): Promise<void> {
    try {
      // 确保日志流存在
      await this.ensureLogStream(options.logGroupName, options.logStreamName);

      const command = new PutLogEventsCommand({
        logGroupName: options.logGroupName,
        logStreamName: options.logStreamName,
        logEvents: options.logEvents.map((event) => ({
          message: event.message,
          timestamp: event.timestamp,
        })),
      });

      await withRetry(() => this.logsClient.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 查询 CloudWatch Logs
   */
  async getLogs(options: CloudWatchGetLogsOptions): Promise<CloudWatchLogEvent[]> {
    try {
      const command = new FilterLogEventsCommand({
        logGroupName: options.logGroupName,
        startTime: options.startTime,
        endTime: options.endTime,
        filterPattern: options.filterPattern,
        limit: options.limit,
      });

      const result = await withRetry(() => this.logsClient.send(command));

      return (result.events || []).map((event) => ({
        message: event.message || '',
        timestamp: event.timestamp || 0,
        logStreamName: event.logStreamName,
      }));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 创建告警（使用 CloudWatch Metrics 和 SNS）
   * 注意：实际创建告警需要 PutMetricAlarm API，但为了简化，这里只提供基本接口
   */
  async createAlarm(options: CloudWatchCreateAlarmOptions): Promise<void> {
    try {
      // 注意：实际的 CloudWatch 告警创建需要使用 PutMetricAlarmCommand
      // 但该命令需要更复杂的配置，这里提供一个基础实现
      // 实际使用时建议直接使用 AWS SDK 的 PutMetricAlarmCommand

      throw new Error(
        'CloudWatch alarm creation requires PutMetricAlarm API. ' +
        'Please use the AWS SDK directly or implement PutMetricAlarmCommand.'
      );
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 确保日志流存在
   */
  private async ensureLogStream(logGroupName: string, logStreamName: string): Promise<void> {
    try {
      // 检查日志流是否存在
      const describeCommand = new DescribeLogStreamsCommand({
        logGroupName,
        logStreamNamePrefix: logStreamName,
        limit: 1,
      });

      const result = await this.logsClient.send(describeCommand);

      const streamExists = result.logStreams?.some(
        (stream) => stream.logStreamName === logStreamName
      );

      if (!streamExists) {
        // 创建日志流
        const createCommand = new CreateLogStreamCommand({
          logGroupName,
          logStreamName,
        });
        await this.logsClient.send(createCommand);
      }
    } catch (error) {
      // 如果日志组不存在，这里会抛出错误，但这是预期的
      // 实际使用时需要先创建日志组
      if (!normalizeAWSError(error).message.includes('ResourceNotFoundException')) {
        throw normalizeAWSError(error);
      }
    }
  }
}