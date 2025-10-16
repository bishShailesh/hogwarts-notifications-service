import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { isOffline } from './validation.util';

export const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
});
