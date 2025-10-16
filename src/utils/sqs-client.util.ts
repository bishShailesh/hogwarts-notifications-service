import { SQSClient } from '@aws-sdk/client-sqs';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:4566' : undefined,
});
