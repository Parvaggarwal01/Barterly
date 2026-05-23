import assert from "node:assert/strict";
import test from "node:test";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../src/validations/auth.validation.js";

test("registerSchema accepts valid registration data and lowercases email", () => {
  const result = registerSchema.parse({
    body: {
      name: "Ada Lovelace",
      email: "ADA@example.COM",
      password: "StrongPass1!",
    },
  });

  assert.equal(result.body.email, "ada@example.com");
  assert.equal(result.body.name, "Ada Lovelace");
});

test("registerSchema rejects weak passwords", () => {
  assert.throws(
    () =>
      registerSchema.parse({
        body: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "password",
        },
      }),
    /Password must contain at least one uppercase letter/,
  );
});

test("loginSchema accepts optional rememberMe", () => {
  const result = loginSchema.parse({
    body: {
      email: "user@example.com",
      password: "secret",
      rememberMe: true,
    },
  });

  assert.equal(result.body.rememberMe, true);
});

test("verifyEmailSchema requires a six digit OTP", () => {
  assert.doesNotThrow(() =>
    verifyEmailSchema.parse({
      body: {
        email: "user@example.com",
        otp: "123456",
      },
    }),
  );

  assert.throws(
    () =>
      verifyEmailSchema.parse({
        body: {
          email: "user@example.com",
          otp: "12345a",
        },
      }),
    /OTP must contain only numbers/,
  );
});

test("resetPasswordSchema rejects mismatched passwords", () => {
  assert.throws(
    () =>
      resetPasswordSchema.parse({
        body: {
          email: "user@example.com",
          otp: "123456",
          password: "StrongPass1!",
          confirmPassword: "DifferentPass1!",
        },
      }),
    /Passwords do not match/,
  );
});
