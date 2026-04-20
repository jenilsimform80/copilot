import { createUserHandler, errorHandler } from '../userController';
import { validateCreateUserRequest } from '../validation';

describe('Create User Endpoint', () => {
  describe('Validation', () => {
    it('should reject empty request body', () => {
      const errors = validateCreateUserRequest(null);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('body');
    });

    it('should reject missing required fields', () => {
      const errors = validateCreateUserRequest({});
      expect(errors.some((e) => e.field === 'email')).toBe(true);
      expect(errors.some((e) => e.field === 'name')).toBe(true);
      expect(errors.some((e) => e.field === 'role')).toBe(true);
    });

    it('should reject invalid email format', () => {
      const errors = validateCreateUserRequest({
        email: 'not-an-email',
        name: 'John',
        role: 'user',
      });
      expect(errors.some((e) => e.field === 'email')).toBe(true);
    });

    it('should reject invalid role', () => {
      const errors = validateCreateUserRequest({
        email: 'test@example.com',
        name: 'John',
        role: 'superadmin', // invalid
      });
      expect(errors.some((e) => e.field === 'role')).toBe(true);
    });

    it('should accept valid input', () => {
      const errors = validateCreateUserRequest({
        email: 'test@example.com',
        name: 'John Doe',
        age: 25,
        role: 'user',
      });
      expect(errors).toHaveLength(0);
    });
  });
});
