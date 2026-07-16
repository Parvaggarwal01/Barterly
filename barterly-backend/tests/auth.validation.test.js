import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../src/validations/auth.validation.js";

describe("Auth Validation Schemas", () => {
  test("registerSchema accepts valid registration data and lowercases email", () => {
    const result = registerSchema.parse({
      body: {
        name: "Ada Lovelace",
        email: "ADA@example.COM",
        password: "StrongPass1!",
      },
    });

    expect(result.body.email).toBe("ada@example.com");
    expect(result.body.name).toBe("Ada Lovelace");
  });

  test("registerSchema rejects weak passwords", () => {
    expect(() =>
      registerSchema.parse({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "password",
        },
      })
    ).toThrow(/Password must contain at least one uppercase letter/);
  });

  test("loginSchema accepts optional rememberMe", () => {
    const result = loginSchema.parse({
      body: {
        email: "user@example.com",
        password: "secret",
        rememberMe: true,
      },
    });

    expect(result.body.rememberMe).toBe(true);
  });

  test("verifyEmailSchema requires a six digit OTP", () => {
    expect(() =>
      verifyEmailSchema.parse({
        body: {
          email: "user@example.com",
          otp: "123456",
        },
      })
    ).not.toThrow();

    expect(() =>
      verifyEmailSchema.parse({
        body: {
          email: "user@example.com",
          otp: "12345a",
        },
      })
    ).toThrow(/OTP must contain only numbers/);
  });

  test("resetPasswordSchema rejects mismatched passwords", () => {
    expect(() =>
      resetPasswordSchema.parse({
        body: {
          email: "user@example.com",
          otp: "123456",
          password: "StrongPass1!",
          confirmPassword: "DifferentPass1!",
        },
      })
    ).toThrow(/Passwords do not match/);
  });
});
