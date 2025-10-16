import type { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { AppError, InternalServerError } from './errors.util';
import { logger } from './logger.util';

/**
 * Wraps a Lambda handler to provide consistent error handling and logging.
 * Usage: export const handler = wrapLambdaHandler(async (event) => { ... });
 */
export function wrapLambdaHandler(
  handler: (event: APIGatewayProxyEvent, context: Context) => Promise<any>,
): APIGatewayProxyHandler {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      logger.error('Lambda handler error', { error });

      if (error instanceof AppError) {
        return {
          statusCode: error.statusCode,
          body: JSON.stringify(error.toApiError()),
        };
      }

      const genericError = new InternalServerError(
        'Internal server error',
        (error as Error)?.message,
      );
      return {
        statusCode: genericError.statusCode,
        body: JSON.stringify(genericError.toApiError()),
      };
    }
  };
}
