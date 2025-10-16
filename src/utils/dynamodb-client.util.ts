import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

export const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
