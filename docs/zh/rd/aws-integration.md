# AWS 集成指南

本文说明如何在 WhatsChat 中集成 AWS 服务：API Gateway WebSocket 与 Chime SDK。

## 概述

WhatsChat 集成两个主要 AWS 服务：

1. **AWS API Gateway WebSocket** – 可扩展的 WebSocket 连接
2. **AWS Chime SDK** – 音视频通话

## 前置条件

- 具备相应权限的 AWS 账号
- 已配置 AWS CLI（可选，用于部署）
- Node.js 18+ 与 pnpm

## API Gateway WebSocket 配置

### 1. 创建 WebSocket API

1. 打开 AWS API Gateway 控制台
2. 创建新的 WebSocket API
3. 配置路由：
   - `$connect` → `connect` Lambda
   - `$disconnect` → `disconnect` Lambda
   - `$default` → `default` Lambda

### 2. 部署 Lambda

从 `apps/server/lambda/websocket/` 部署：

```bash
cd apps/server/lambda/websocket
npm install
npm run build
npm run package
```

使用 AWS CLI 或 Serverless Framework 部署到 Lambda。

### 3. 创建 DynamoDB 表

用于存储 WebSocket 连接：

- 表名：`websocket-connections`（或通过 `CONNECTIONS_TABLE` 配置）
- 分区键：`connectionId` (String)
- TTL 属性：`ttl` (Number)

### 4. 环境变量

在 `.env` 中添加：

```env
AWS_API_GATEWAY_WEBSOCKET_ENABLED=true
AWS_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
CONNECTIONS_TABLE=websocket-connections
```

### 5. IAM 权限

Lambda 需要 DynamoDB 与 execute-api:ManageConnections 权限（详见 [英文版](../en/rd/aws-integration.md) 中的 JSON）。

## Chime SDK 配置

### 1. 启用 Chime SDK

在 `.env` 中添加：

```env
AWS_CHIME_ENABLED=true
AWS_CHIME_REGION=us-east-1
AWS_CHIME_MEDIA_REGION=us-east-1
```

### 2. AWS 凭证

配置 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION`。

### 3. IAM 权限

应用需要 chime:CreateMeeting、CreateAttendee 等权限（详见 [英文版](../en/rd/aws-integration.md)）。

### 4. 前端依赖

```bash
cd apps/web
pnpm add amazon-chime-sdk-js
```

## 前端配置

在 `apps/web/` 下创建 `.env.local`：

```env
NEXT_PUBLIC_WEBSOCKET_MODE=apigateway
NEXT_PUBLIC_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
NEXT_PUBLIC_WEBRTC_MODE=chime
```

## 迁移策略

1. **阶段 1**：仅新通话启用 Chime SDK  
2. **阶段 2**：现有通话迁移到 Chime SDK  
3. **阶段 3**：新连接启用 API Gateway WebSocket  
4. **阶段 4**：全部连接迁移到 API Gateway WebSocket  

通过 `AWS_CHIME_ENABLED` 与 `AWS_API_GATEWAY_WEBSOCKET_ENABLED` 独立开关两个服务。

## 成本（参考）

- API Gateway WebSocket：约 $0.25/百万条消息，$0.35/百万连接分钟
- Chime SDK：约 $0.0017/参会者·分钟（音频），$0.007（视频）；免费档 100 参会者·分钟/月

## 故障排查

- **WebSocket**：检查端点 URL、Lambda 部署、DynamoDB 表、IAM
- **Chime**：检查凭证、IAM、区域与会议创建日志

## 安全与监控

- WebSocket：在 `connect` Lambda 中校验 JWT，连接带用户 ID 与 TTL
- Chime：服务端生成参会者令牌，按外部用户 ID 识别
- 监控：CloudWatch 指标与日志（API Gateway、Lambda、Chime）

## 参考链接

- [API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [Chime SDK](https://docs.aws.amazon.com/chime/latest/dg/meetings-sdk.html)
- [Chime SDK JavaScript](https://aws.github.io/amazon-chime-sdk-js/)

中文 | [English](../../en/rd/aws-integration.md)
