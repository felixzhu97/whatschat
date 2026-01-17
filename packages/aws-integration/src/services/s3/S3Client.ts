import { S3Client as AWSS3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AWSConfig } from '../../types';
import type { S3UploadOptions, S3DownloadOptions, S3PresignedUrlOptions } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * S3 客户端封装类
 */
export class S3Client {
  private client: AWSS3Client;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new AWSS3Client(mergedConfig);
  }

  /**
   * 上传文件到 S3
   */
  async uploadFile(options: S3UploadOptions): Promise<{ key: string; etag?: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        key: options.key,
        etag: result.ETag,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 从 S3 下载文件
   */
  async downloadFile(options: S3DownloadOptions): Promise<Uint8Array> {
    try {
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
      });

      const result = await withRetry(() => this.client.send(command));
      
      if (!result.Body) {
        throw new Error('File body is empty');
      }

      // 将 stream 转换为 Uint8Array
      const chunks: Uint8Array[] = [];
      // @ts-expect-error - Body 可能是 ReadableStream
      for await (const chunk of result.Body) {
        chunks.push(chunk);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      return merged;
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 从 S3 删除文件
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 列出 S3 存储桶中的文件
   */
  async listFiles(
    bucket: string,
    prefix?: string,
    maxKeys?: number
  ): Promise<Array<{ key: string; size?: number; lastModified?: Date }>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await withRetry(() => this.client.send(command));

      return (result.Contents || []).map((item) => ({
        key: item.Key || '',
        size: item.Size,
        lastModified: item.LastModified,
      }));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 生成预签名 URL
   */
  async generatePresignedUrl(options: S3PresignedUrlOptions): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: options.key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn || 3600,
      });

      return url;
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}