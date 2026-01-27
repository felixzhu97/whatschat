# WebSocket Lambda Functions

Lambda functions for handling AWS API Gateway WebSocket connections.

## Functions

- **connect.ts**: Handles WebSocket connection establishment
- **disconnect.ts**: Handles WebSocket disconnection cleanup
- **default.ts**: Handles default message routing

## Environment Variables

- `CONNECTIONS_TABLE`: DynamoDB table name for storing connections (default: `websocket-connections`)
- `API_GATEWAY_ENDPOINT`: API Gateway WebSocket endpoint URL
- `JWT_SECRET`: JWT secret for token verification

## Deployment

1. Build TypeScript:
```bash
npm run build
```

2. Package for Lambda:
```bash
npm run package
```

3. Deploy to AWS Lambda using AWS CLI or Serverless Framework

## DynamoDB Table Schema

Create a DynamoDB table with:
- Partition key: `connectionId` (String)
- TTL attribute: `ttl` (Number)

## IAM Permissions

Lambda functions need the following permissions:
- `dynamodb:PutItem`
- `dynamodb:GetItem`
- `dynamodb:DeleteItem`
- `dynamodb:Query`
- `execute-api:ManageConnections`
