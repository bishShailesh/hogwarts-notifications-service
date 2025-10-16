import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

const dynamoDbClient = new DynamoDBClient({
  region: isOffline ? 'localhost' : process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const notificationId = event.pathParameters?.id;
    if (!notificationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing notification id in path' }),
      };
    }

    console.log('table name:', TABLE_NAME);
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: notificationId },
      }),
    );
    console.info('GetCommand result:', result);

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Notification not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: (error as Error).message }),
    };
  }
};
