import type { APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  // If running offline, always authorize
  if (process.env.IS_OFFLINE === 'true' || process.env.STAGE === 'offline') {
    return {
      principalId: 'offline-user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        user: 'offline-user',
      },
    };
  }

  // TODO: Implement JWT validation for production
  // 1. Extract token from event.headers.Authorization
  // 2. Validate JWT signature and claims
  // 3. Return Allow or Deny policy

  // Default: Deny access
  return {
    principalId: 'unauthorized',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: event.methodArn,
        },
      ],
    },
    context: {},
  };
};
