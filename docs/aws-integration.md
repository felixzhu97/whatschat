# AWS Integration Guide

This document provides instructions for integrating AWS services (API Gateway WebSocket and Chime SDK) into the WhatsChat application.

## Overview

WhatsChat integrates two main AWS services:

1. **AWS API Gateway WebSocket** - For scalable WebSocket connections
2. **AWS Chime SDK** - For high-quality audio/video calls

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (optional, for deployment)
- Node.js 18+ and pnpm installed

## AWS API Gateway WebSocket Setup

### 1. Create API Gateway WebSocket API

1. Go to AWS API Gateway Console
2. Create a new WebSocket API
3. Configure routes:
   - `$connect` - Route to `connect` Lambda function
   - `$disconnect` - Route to `disconnect` Lambda function
   - `$default` - Route to `default` Lambda function

### 2. Deploy Lambda Functions

Deploy the Lambda functions from `apps/server/lambda/websocket/`:

```bash
cd apps/server/lambda/websocket
npm install
npm run build
npm run package
```

Then deploy to AWS Lambda using AWS CLI or Serverless Framework.

### 3. Create DynamoDB Table

Create a DynamoDB table for storing WebSocket connections:

- Table name: `websocket-connections` (or configure via `CONNECTIONS_TABLE` env var)
- Partition key: `connectionId` (String)
- TTL attribute: `ttl` (Number)

### 4. Configure Environment Variables

Add to your `.env` file:

```env
AWS_API_GATEWAY_WEBSOCKET_ENABLED=true
AWS_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
CONNECTIONS_TABLE=websocket-connections
```

### 5. IAM Permissions

Lambda functions need the following IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/websocket-connections"
    },
    {
      "Effect": "Allow",
      "Action": [
        "execute-api:ManageConnections"
      ],
      "Resource": "arn:aws:execute-api:*:*:*/*/@connections/*"
    }
  ]
}
```

## AWS Chime SDK Setup

### 1. Enable Chime SDK

Add to your `.env` file:

```env
AWS_CHIME_ENABLED=true
AWS_CHIME_REGION=us-east-1
AWS_CHIME_MEDIA_REGION=us-east-1
```

### 2. Configure AWS Credentials

Ensure AWS credentials are configured:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### 3. IAM Permissions

Your application needs the following IAM permissions for Chime SDK:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "chime:CreateMeeting",
        "chime:GetMeeting",
        "chime:DeleteMeeting",
        "chime:CreateAttendee",
        "chime:DeleteAttendee",
        "chime:BatchCreateAttendee",
        "chime:ListAttendees"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Install Frontend Dependencies

```bash
cd apps/web
pnpm add amazon-chime-sdk-js
```

## Frontend Configuration

### Environment Variables

Create `.env.local` in `apps/web/`:

```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_MODE=apigateway  # Options: socketio, apigateway, simulated
NEXT_PUBLIC_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production

# WebRTC Configuration
NEXT_PUBLIC_WEBRTC_MODE=chime  # Options: native, chime, simulated
```

## Usage

### Backend

The backend automatically uses Chime SDK when enabled:

```typescript
// Chime service is automatically available
const chimeService = app.get(ChimeService);

// Create a meeting
const meeting = await chimeService.createMeeting(userId, {
  externalMeetingId: `call-${userId}-${Date.now()}`,
});

// Create an attendee
const attendee = await chimeService.createAttendee(meeting.meetingId, userId);
```

### Frontend

The frontend adapters automatically switch between modes based on configuration:

```typescript
// WebSocket adapter automatically uses API Gateway if configured
const wsAdapter = getWebSocketAdapter();

// WebRTC adapter automatically uses Chime SDK if configured
const rtcAdapter = getWebRTCAdapter();
```

## Migration Strategy

### Gradual Migration

1. **Phase 1**: Enable Chime SDK for new calls only
2. **Phase 2**: Migrate existing calls to Chime SDK
3. **Phase 3**: Enable API Gateway WebSocket for new connections
4. **Phase 4**: Migrate all connections to API Gateway WebSocket

### Configuration Flags

Both services can be enabled/disabled independently:

- `AWS_CHIME_ENABLED` - Enable/disable Chime SDK
- `AWS_API_GATEWAY_WEBSOCKET_ENABLED` - Enable/disable API Gateway WebSocket

## Cost Considerations

### API Gateway WebSocket

- $0.25 per million messages
- $0.35 per million connection minutes
- Data transfer charges apply

### Chime SDK

- $0.0017 per attendee-minute for audio
- $0.007 per attendee-minute for video
- Free tier: 100 attendee-minutes per month

## Troubleshooting

### WebSocket Connection Issues

1. Check API Gateway endpoint URL
2. Verify Lambda functions are deployed
3. Check DynamoDB table exists
4. Verify IAM permissions

### Chime SDK Issues

1. Verify AWS credentials are configured
2. Check IAM permissions
3. Ensure Chime SDK is enabled in the region
4. Check meeting creation logs

## Security

### WebSocket Authentication

- JWT tokens are validated in the `connect` Lambda function
- Connections are stored with user ID mapping
- TTL ensures connections expire after 24 hours

### Chime SDK Security

- Meeting creation requires authentication
- Attendee tokens are generated server-side
- External user IDs are used for attendee identification

## Monitoring

### CloudWatch Metrics

- API Gateway: Connection count, message count, errors
- Chime SDK: Meeting count, attendee count, duration
- Lambda: Invocation count, errors, duration

### Logging

All services log to CloudWatch Logs:
- `/aws/apigateway/websocket`
- `/aws/lambda/websocket-connect`
- `/aws/lambda/websocket-disconnect`
- `/aws/lambda/websocket-default`

## Additional Resources

- [AWS API Gateway WebSocket Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [AWS Chime SDK Documentation](https://docs.aws.amazon.com/chime/latest/dg/meetings-sdk.html)
- [Chime SDK JavaScript Guide](https://aws.github.io/amazon-chime-sdk-js/)
