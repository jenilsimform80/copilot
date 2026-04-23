import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RegistrationForm } from "../RegistrationForm";

function fillValid() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { name: "email", value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { name: "name", value: "John Doe" },
  });
  fireEvent.change(screen.getByLabelText("Role"), {
    target: { name: "role", value: "user" },
  });
}

describe("RegistrationForm", () => {
  describe("rendering", () => {
    it("renders all form fields and submit button", () => {
      render(<RegistrationForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Age (optional)")).toBeInTheDocument();
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    });
  });

  describe("validation — empty inputs", () => {
    it("shows required errors when submitting empty form", () => {
      render(<RegistrationForm />);
      fireEvent.submit(screen.getByRole("form"));

      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Role is required")).toBeInTheDocument();
    });

    it("does not call onSubmit when the form is empty", () => {
      const onSubmit = jest.fn();
      render(<RegistrationForm onSubmit={onSubmit} />);
      fireEvent.submit(screen.getByRole("form"));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("validation — whitespace trimming", () => {
    it("treats whitespace-only email as empty and shows required error", () => {
      render(<RegistrationForm />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { name: "email", value: "   " },
      });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { name: "name", value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { name: "role", value: "user" },
      });
      fireEvent.submit(screen.getByRole("form"));
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    it("treats whitespace-only name as empty and shows required error", () => {
      render(<RegistrationForm />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { name: "email", value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { name: "name", value: "   " },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { name: "role", value: "user" },
      });
      fireEvent.submit(screen.getByRole("form"));
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    it("trims whitespace from email before passing to onSubmit", async () => {
      const onSubmit = jest.fn();
      render(<RegistrationForm onSubmit={onSubmit} />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { name: "email", value: "  TEST@EXAMPLE.COM  " },
      });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { name: "name", value: "Jane" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { name: "role", value: "user" },
      });
      fireEvent.submit(screen.getByRole("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com" })
      );
    });
  });

  describe("validation — email", () => {
    it("shows error for invalid email format", () => {
      render(<RegistrationForm />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { name: "email", value: "not-an-email" },
      });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { name: "name", value: "John" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { name: "role", value: "user" },
      });
      fireEvent.submit(screen.getByRole("form"));
      expect(screen.getByText("Email format is invalid")).toBeInTheDocument();
    });
  });

  describe("validation — name", () => {
    it("shows error when name is shorter than 2 characters", () => {
      render(<RegistrationForm />);
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { name: "email", value: "a@b.com" },
      });
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { name: "name", value: "A" },
      });
      fireEvent.change(screen.getByLabelText("Role"), {
        target: { name: "role", value: "user" },
      });
      fireEvent.submit(screen.getByRole("form"));
      expect(
        screen.getByText("Name must be between 2 and 100 characters")
      ).toBeInTheDocument();
    });
  });

  describe("validation — age", () => {
    it("shows error for age above 150", () => {
      render(<RegistrationForm />);
      fillValid();
      fireEvent.change(screen.getByLabelText("Age (optional)"), {
        target: { name: "age", value: "200" },
      });
      fireEvent.submit(screen.getByRole("form"));
      expect(screen.getByText("Age must be between 0 and 150")).toBeInTheDocument();
    });

    it("accepts a valid optional age", async () => {
      const onSubmit = jest.fn();
      render(<RegistrationForm onSubmit={onSubmit} />);
      fillValid();
      fireEvent.change(screen.getByLabelText("Age (optional)"), {
        target: { name: "age", value: "25" },
      });
      fireEvent.submit(screen.getByRole("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ age: 25 })
      );
    });

    it("omits age from submitted data when left empty", async () => {
      const onSubmit = jest.fn();
      render(<RegistrationForm onSubmit={onSubmit} />);
      fillValid();
      fireEvent.submit(screen.getByRole("form"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      const arg = onSubmit.mock.calls[0][0];
      expect(arg).not.toHaveProperty("age");
    });
  });

  describe("successful submission", () => {
    it("calls onSubmit with sanitized data and shows success message", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      render(<RegistrationForm onSubmit={onSubmit} />);
      fillValid();
      fireEvent.submit(screen.getByRole("form"));
      await waitFor(() =>
        expect(screen.getByText("Registration successful!")).toBeInTheDocument()
      );
      expect(onSubmit).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "John Doe",
        role: "user",
      });
    });

    it("shows submit error when onSubmit throws", async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error("Server error"));
      render(<RegistrationForm onSubmit={onSubmit} />);
      fillValid();
      fireEvent.submit(screen.getByRole("form"));
      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent("Server error")
      );
    });
  });

  describe("aria attributes", () => {
    it("marks invalid fields with aria-invalid", () => {
      render(<RegistrationForm />);
      fireEvent.submit(screen.getByRole("form"));
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    });
  });
});
