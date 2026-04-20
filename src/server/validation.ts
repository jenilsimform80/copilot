import { CreateUserRequest, ValidationError } from './types/user.types';

/**
 * Validates email format using regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates user creation request data
 * Returns array of validation errors (empty if valid)
 */
export function validateCreateUserRequest(
  data: unknown
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'body',
      message: 'Request body must be a valid JSON object',
    });
    return errors;
  }

  const body = data as Record<string, unknown>;

  // Validate email (required, format)
  if (!body.email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (typeof body.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email must be a string',
      value: body.email,
    });
  } else if (!isValidEmail(body.email)) {
    errors.push({
      field: 'email',
      message: 'Email format is invalid',
      value: body.email,
    });
  }

  // Validate name (required, min/max length)
  if (!body.name) {
    errors.push({
      field: 'name',
      message: 'Name is required',
    });
  } else if (typeof body.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Name must be a string',
      value: body.name,
    });
  } else if (body.name.length < 2 || body.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Name must be between 2 and 100 characters',
      value: body.name,
    });
  }

  // Validate age (optional, must be positive integer)
  if (body.age !== undefined) {
    if (typeof body.age !== 'number' || !Number.isInteger(body.age)) {
      errors.push({
        field: 'age',
        message: 'Age must be an integer',
        value: body.age,
      });
    } else if (body.age < 0 || body.age > 150) {
      errors.push({
        field: 'age',
        message: 'Age must be between 0 and 150',
        value: body.age,
      });
    }
  }

  // Validate role (required, enum)
  const validRoles = ['admin', 'user', 'guest'];
  if (!body.role) {
    errors.push({
      field: 'role',
      message: 'Role is required',
    });
  } else if (!validRoles.includes(body.role as string)) {
    errors.push({
      field: 'role',
      message: `Role must be one of: ${validRoles.join(', ')}`,
      value: body.role,
    });
  }

  return errors;
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
export function sanitizeUserInput(
  data: CreateUserRequest
): CreateUserRequest {
  return {
    email: data.email.trim().toLowerCase(),
    name: data.name.trim().replace(/[<>]/g, ''),
    age: data.age,
    role: data.role,
  };
}
