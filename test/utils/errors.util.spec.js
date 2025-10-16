'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const errors_util_1 = require('../../src/utils/errors.util');
describe('Error Utilities', () => {
  it('should create an AppError with correct properties', () => {
    const error = new errors_util_1.AppError('Test error', 418, 'TEAPOT', 'Extra details');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.details).toBe('Extra details');
    expect(error.toApiError()).toEqual({
      statusCode: 418,
      code: 'TEAPOT',
      message: 'Test error',
      details: 'Extra details',
    });
  });
  it('should create a BadRequestError with default code', () => {
    const error = new errors_util_1.BadRequestError('Bad request', 'Some details');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.details).toBe('Some details');
  });
  it('should create a NotFoundError with correct code and message', () => {
    const error = new errors_util_1.NotFoundError('Notification', 'Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Notification not found');
    expect(error.details).toBe('Not found');
  });
  it('should create an InternalServerError with correct code and message', () => {
    const error = new errors_util_1.InternalServerError('Internal error', 'Stack trace');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.message).toBe('Internal error');
    expect(error.details).toBe('Stack trace');
  });
});
