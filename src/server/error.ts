import { ApiError, ValidationError } from './types/user.types';

/**
 * Custom error class for API errors with proper typing
 */
export class ApiException extends Error {
  public readonly status: number;
  public readonly details?: ValidationError[];

  constructor(status: number, message: string, details?: ValidationError[]) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
  }

  toResponse(): ApiError {
    return {
      status: this.status,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Factory functions for common error types
 */
export const Errors = {
  badRequest(message: string, details?: ValidationError[]): ApiException {
    return new ApiException(400, message, details);
  },

  unauthorized(message = 'Unauthorized'): ApiException {
    return new ApiException(401, message);
  },

  forbidden(message = 'Forbidden'): ApiException {
    return new ApiException(403, message);
  },

  notFound(resource = 'Resource'): ApiException {
    return new ApiException(404, `${resource} not found`);
  },

  conflict(message: string): ApiException {
    return new ApiException(409, message);
  },

  internal(message = 'Internal server error'): ApiException {
    return new ApiException(500, message);
  },
};
