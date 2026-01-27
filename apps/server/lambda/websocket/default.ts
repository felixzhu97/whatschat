import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'websocket-connections';
const API_GATEWAY_ENDPOINT = process.env.API_GATEWAY_ENDPOINT || '';

/**
 * Lambda handler for default WebSocket message routing
 * Routes messages to appropriate handlers or backend API
 */
export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const messageBody = event.body ? JSON.parse(event.body) : {};

  try {
    // Get connection information
    const connection = await dynamoClient.send(
      new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        KeyConditionExpression: 'connectionId = :connectionId',
        ExpressionAttributeValues: {
          ':connectionId': connectionId,
        },
      })
    );

    const userId = connection.Items?.[0]?.userId;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized: Connection not found' }),
      };
    }

    // Route message based on type
    const messageType = messageBody.type;

    switch (messageType) {
      case 'ping':
        // Echo back pong
        await sendToConnection(connectionId, { type: 'pong', timestamp: Date.now() });
        break;

      case 'message:send':
        // Forward to backend API or process directly
        // TODO: Call your backend API endpoint or process message
        await sendToConnection(connectionId, {
          type: 'message:sent',
          message: 'Message received and processed',
        });
        break;

      default:
        // Echo back for unknown message types
        await sendToConnection(connectionId, {
          type: 'echo',
          original: messageBody,
        });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message processed' }),
    };
  } catch (error) {
    console.error('Message processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

/**
 * Helper function to send message to a connection
 */
async function sendToConnection(connectionId: string, data: Record<string, unknown>) {
  if (!API_GATEWAY_ENDPOINT) {
    console.warn('API Gateway endpoint not configured');
    return;
  }

  const apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint: API_GATEWAY_ENDPOINT,
  });

  try {
    await apiGatewayClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      })
    );
  } catch (error: any) {
    // If connection is gone (410), it's okay to ignore
    if (error.statusCode !== 410) {
      console.error('Failed to send message to connection:', error);
      throw error;
    }
  }
}
