import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import type { AWSConfig } from '../../types';
import type {
  CognitoSignUpOptions,
  CognitoSignInOptions,
  CognitoConfirmSignUpOptions,
  CognitoRefreshTokenOptions,
} from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * Cognito 登录结果
 */
export interface CognitoSignInResult {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Cognito 用户信息
 */
export interface CognitoUserInfo {
  username: string;
  attributes: Record<string, string>;
}

/**
 * Cognito 客户端封装类
 */
export class CognitoClient {
  private client: CognitoIdentityProviderClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new CognitoIdentityProviderClient(mergedConfig);
  }

  /**
   * 注册新用户
   */
  async signUp(options: CognitoSignUpOptions): Promise<{ userSub: string }> {
    try {
      const userAttributes: Array<{ Name: string; Value: string }> = [];

      if (options.email) {
        userAttributes.push({ Name: 'email', Value: options.email });
      }

      if (options.phoneNumber) {
        userAttributes.push({ Name: 'phone_number', Value: options.phoneNumber });
      }

      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          userAttributes.push({ Name: key, Value: String(value) });
        });
      }

      const command = new SignUpCommand({
        ClientId: options.clientId,
        Username: options.username,
        Password: options.password,
        UserAttributes: userAttributes.length > 0 ? userAttributes : undefined,
      });

      const result = await withRetry(() => this.client.send(command));
      return {
        userSub: result.UserSub || '',
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 用户登录
   */
  async signIn(options: CognitoSignInOptions): Promise<CognitoSignInResult> {
    try {
      const authParams: InitiateAuthCommandInput = {
        ClientId: options.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: options.username,
          PASSWORD: options.password,
        },
      };

      const command = new InitiateAuthCommand(authParams);
      const result = await withRetry(() => this.client.send(command));

      const authenticationResult = result.AuthenticationResult;

      return {
        accessToken: authenticationResult?.AccessToken,
        refreshToken: authenticationResult?.RefreshToken,
        idToken: authenticationResult?.IdToken,
        expiresIn: authenticationResult?.ExpiresIn,
        tokenType: authenticationResult?.TokenType,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 确认用户注册
   */
  async confirmSignUp(options: CognitoConfirmSignUpOptions): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: options.clientId,
        Username: options.username,
        ConfirmationCode: options.confirmationCode,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(options: CognitoRefreshTokenOptions): Promise<CognitoSignInResult> {
    try {
      const authParams: InitiateAuthCommandInput = {
        ClientId: options.clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: options.refreshToken,
        },
      };

      const command = new InitiateAuthCommand(authParams);
      const result = await withRetry(() => this.client.send(command));

      const authenticationResult = result.AuthenticationResult;

      return {
        accessToken: authenticationResult?.AccessToken,
        refreshToken: options.refreshToken, // 刷新令牌保持不变
        idToken: authenticationResult?.IdToken,
        expiresIn: authenticationResult?.ExpiresIn,
        tokenType: authenticationResult?.TokenType,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 获取用户信息
   */
  async getUser(accessToken: string): Promise<CognitoUserInfo> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const result = await withRetry(() => this.client.send(command));

      const attributes: Record<string, string> = {};
      if (result.UserAttributes) {
        result.UserAttributes.forEach((attr) => {
          if (attr.Name && attr.Value) {
            attributes[attr.Name] = attr.Value;
          }
        });
      }

      return {
        username: result.Username || '',
        attributes,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}