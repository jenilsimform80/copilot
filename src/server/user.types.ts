/**
 * User-related type definitions for the REST API
 */

export interface CreateUserRequest {
  email: string;
  name: string;
  age?: number;
  role: 'admin' | 'user' | 'guest';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  age?: number;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface ApiError {
  status: number;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}
