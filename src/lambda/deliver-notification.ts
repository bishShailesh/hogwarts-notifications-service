import { SQSEvent, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

const dynamoDbClient = new DynamoDBClient({
  region: isOffline ? 'localhost' : process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE!;

export const handler = async (event: SQSEvent, context: Context) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const notificationId = body.notificationId;

      // Fetch notification from DynamoDB
      const getResult = await dynamoDb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { id: notificationId },
        }),
      );

      const notification = getResult.Item;
      if (!notification) {
        console.warn(`Notification with id ${notificationId} not found`);
        continue;
      }

      // Simulate delivery (offline: just log, online: TODO integrate with real delivery)
      if (isOffline) {
        console.log(`Simulated delivery to ${notification.recipient}: ${notification.message}`);
      } else {
        // TODO: Integrate with actual notification delivery service (email, SMS, etc.)
        console.log(
          `Delivering notification to ${notification.recipient}: ${notification.message}`,
        );
      }

      // Update status to 'delivered'
      await dynamoDb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id: notificationId },
          UpdateExpression: 'set #status = :delivered',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':delivered': 'delivered' },
        }),
      );
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }
  return { statusCode: 200 };
};
