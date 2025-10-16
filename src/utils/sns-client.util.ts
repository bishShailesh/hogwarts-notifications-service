import { SNSClient } from '@aws-sdk/client-sns';
import { isOffline } from './validation.util';

export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline ? 'http://localhost:4566' : undefined,
});
