import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

const dynamoDbClient = new DynamoDBClient({
  region: isOffline ? 'localhost' : process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:4566' : undefined, // LocalStack SQS endpoint
});

const TABLE_NAME = process.env.DYNAMODB_TABLE!;
const QUEUE_URL = process.env.NOTIFICATION_QUEUE_URL!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const payload = JSON.parse(event.body);

    // Validate payload using generated types (basic check)
    if (
      !payload.recipientId ||
      !payload.recipient ||
      !payload.message ||
      typeof payload.recipientId !== 'string' ||
      typeof payload.recipient !== 'string' ||
      typeof payload.message !== 'string'
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid notification payload' }),
      };
    }

    const notification: Components.Schemas.Notification = {
      id: uuidv4(),
      recipientId: payload.recipientId,
      recipient: payload.recipient,
      message: payload.message,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    console.log('notification to store:', notification);

    // Store notification in DynamoDB
    const result = await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: notification,
      }),
    );
    console.log('PutCommand result:', result);

    console.log('QUEUE_URL:', QUEUE_URL);

    // Put notification in SQS queue
    const sqsResult = await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({ notificationId: notification.id }),
      }),
    );
    console.log('SendMessageCommand result:', sqsResult);

    return {
      statusCode: 201,
      body: JSON.stringify(notification),
    };
  } catch (error) {
    console.error('Error in create-notification handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: (error as Error).message }),
    };
  }
};
