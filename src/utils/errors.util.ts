export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: string;

  constructor(message: string, statusCode = 500, code?: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? 'ERROR'; // Default code if not provided
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // Ensures instanceof works
  }

  toApiError(): Components.Schemas.Error {
    return {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

// Custom errors as defined in api.yaml
export class NotFoundError extends AppError {
  constructor(message = 'Resource', details?: string) {
    super(`${message} not found`, 404, 'NOT_FOUND', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: string) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details?: string) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: string) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: string) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: string) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: string) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}
