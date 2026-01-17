import type { AWSConfig } from "../types";
import type { Credentials } from "@aws-sdk/types";

/**
 * 从环境变量获取 AWS 配置
 */
export function getAWSConfigFromEnv(): Partial<AWSConfig> {
  const config: Partial<AWSConfig> = {};

  if (process.env.AWS_REGION) {
    config.region = process.env.AWS_REGION;
  }

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN && {
        sessionToken: process.env.AWS_SESSION_TOKEN,
      }),
    };
  }

  if (process.env.AWS_ENDPOINT) {
    config.endpoint = process.env.AWS_ENDPOINT;
  }

  return config;
}

/**
 * 合并 AWS 配置
 */
export function mergeAWSConfig(
  defaultConfig?: Partial<AWSConfig>,
  userConfig?: Partial<AWSConfig>
): AWSConfig {
  const envConfig = getAWSConfigFromEnv();

  return {
    ...envConfig,
    ...defaultConfig,
    ...userConfig,
    // 合并 credentials
    credentials:
      userConfig?.credentials ||
      defaultConfig?.credentials ||
      envConfig.credentials,
  } as AWSConfig;
}

/**
 * 验证 AWS 配置
 */
export function validateAWSConfig(
  config: Partial<AWSConfig>
): config is AWSConfig {
  if (!config.region) {
    throw new Error("AWS region is required");
  }

  return true;
}
