import React, { useState, useCallback } from "react";

interface RegistrationFormProps {
  onSubmit?: (data: RegistrationData) => void | Promise<void>;
}

export interface RegistrationData {
  email: string;
  name: string;
  age?: number;
  role: "admin" | "user" | "guest";
}

interface FormErrors {
  email?: string;
  name?: string;
  age?: string;
  role?: string;
}

const VALID_ROLES = ["admin", "user", "guest"] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: {
  email: string;
  name: string;
  age: string;
  role: string;
}): FormErrors {
  const errors: FormErrors = {};

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = "Email format is invalid";
  }

  const trimmedName = values.name.trim();
  if (!trimmedName) {
    errors.name = "Name is required";
  } else if (trimmedName.length < 2 || trimmedName.length > 100) {
    errors.name = "Name must be between 2 and 100 characters";
  }

  if (values.age !== "") {
    const ageNum = Number(values.age);
    if (!Number.isInteger(ageNum) || isNaN(ageNum)) {
      errors.age = "Age must be a whole number";
    } else if (ageNum < 0 || ageNum > 150) {
      errors.age = "Age must be between 0 and 150";
    }
  }

  if (!values.role) {
    errors.role = "Role is required";
  } else if (!VALID_ROLES.includes(values.role as (typeof VALID_ROLES)[number])) {
    errors.role = "Role must be one of: admin, user, guest";
  }

  return errors;
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps) {
  const [values, setValues] = useState({ email: "", name: "", age: "", role: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(undefined);

      const validationErrors = validateForm(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        const data: RegistrationData = {
          email: values.email.trim().toLowerCase(),
          name: values.name.trim(),
          role: values.role as RegistrationData["role"],
          ...(values.age !== "" ? { age: Number(values.age) } : {}),
        };
        await onSubmit?.(data);
        setSubmitted(true);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Submission failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  if (submitted) {
    return <p role="status">Registration successful!</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
      {submitError && (
        <p role="alert" aria-live="assertive">
          {submitError}
        </p>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          autoComplete="email"
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          autoComplete="name"
        />
        {errors.name && (
          <span id="name-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="age">Age (optional)</label>
        <input
          id="age"
          name="age"
          type="number"
          value={values.age}
          onChange={handleChange}
          aria-invalid={!!errors.age}
          aria-describedby={errors.age ? "age-error" : undefined}
          min={0}
          max={150}
        />
        {errors.age && (
          <span id="age-error" role="alert">
            {errors.age}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.role}
          aria-describedby={errors.role ? "role-error" : undefined}
        >
          <option value="">Select a role</option>
          {VALID_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.role && (
          <span id="role-error" role="alert">
            {errors.role}
          </span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
