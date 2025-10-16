import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

const dynamoDbClient = new DynamoDBClient({
  region: isOffline ? 'localhost' : process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { recipientId, recipient, limit } = event.queryStringParameters || {};

    // Build filter expression
    let FilterExpression = '';
    let ExpressionAttributeNames: Record<string, string> = {};
    let ExpressionAttributeValues: Record<string, any> = {};

    if (recipientId) {
      FilterExpression += '#recipientId = :recipientId';
      ExpressionAttributeNames['#recipientId'] = 'recipientId';
      ExpressionAttributeValues[':recipientId'] = recipientId;
    }
    if (recipient) {
      if (FilterExpression) FilterExpression += ' AND ';
      FilterExpression += '#recipient = :recipient';
      ExpressionAttributeNames['#recipient'] = 'recipient';
      ExpressionAttributeValues[':recipient'] = recipient;
    }

    const scanParams: any = {
      TableName: TABLE_NAME,
    };

    if (FilterExpression) {
      scanParams.FilterExpression = FilterExpression;
      scanParams.ExpressionAttributeNames = ExpressionAttributeNames;
      scanParams.ExpressionAttributeValues = ExpressionAttributeValues;
    }
    if (limit) {
      scanParams.Limit = Number(limit);
    }

    const result = await dynamoDb.send(new ScanCommand(scanParams));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: (error as Error).message }),
    };
  }
};
