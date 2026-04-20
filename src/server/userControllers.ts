import { Request, Response, NextFunction } from 'express';
import { CreateUserRequest, UserResponse } from './types/user.types';
import { validateCreateUserRequest, sanitizeUserInput } from './validation';
import { ApiException, Errors } from './errors';

/**
 * POST /api/users
 * Creates a new user with validation and error handling
 *
 * @example Request body:
 * {
 *   "email": "user@example.com",
 *   "name": "John Doe",
 *   "age": 25,
 *   "role": "user"
 * }
 *
 * @example Success response (201):
 * {
 *   "id": "usr_abc123",
 *   "email": "user@example.com",
 *   "name": "John Doe",
 *   "age": 25,
 *   "role": "user",
 *   "createdAt": "2026-04-20T10:30:00.000Z"
 * }
 *
 * @example Error response (400):
 * {
 *   "status": 400,
 *   "message": "Validation failed",
 *   "details": [
 *     { "field": "email", "message": "Email format is invalid" }
 *   ]
 * }
 */
export async function createUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Step 1: Validate request body
    const validationErrors = validateCreateUserRequest(req.body);

    if (validationErrors.length > 0) {
      throw Errors.badRequest('Validation failed', validationErrors);
    }

    // Step 2: Sanitize input
    const sanitizedData = sanitizeUserInput(req.body as CreateUserRequest);

    // Step 3: Check for duplicate email (simulated)
    const emailExists = await checkEmailExists(sanitizedData.email);
    if (emailExists) {
      throw Errors.conflict('User with this email already exists');
    }

    // Step 4: Create user (simulated database operation)
    const newUser = await createUserInDatabase(sanitizedData);

    // Step 5: Return success response
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.path}:`, error.message);

  if (error instanceof ApiException) {
    res.status(error.status).json(error.toResponse());
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    status: 500,
    message: 'Internal server error',
  });
}

// --- Helper functions (simulated database operations) ---

async function checkEmailExists(email: string): Promise<boolean> {
  // Simulated: would query database in real implementation
  const existingEmails = ['existing@example.com'];
  return existingEmails.includes(email);
}

async function createUserInDatabase(
  data: CreateUserRequest
): Promise<UserResponse> {
  // Simulated: would insert into database in real implementation
  return {
    id: `usr_${Date.now()}`,
    email: data.email,
    name: data.name,
    age: data.age,
    role: data.role,
    createdAt: new Date(),
  };
}
