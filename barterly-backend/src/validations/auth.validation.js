import { z } from "zod";

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .trim(),

    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email")
      .toLowerCase()
      .trim(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
      ),
  }),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email")
      .toLowerCase()
      .trim(),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),

    rememberMe: z.boolean().optional(),
  }),
});

/**
 * Verify email validation schema with OTP
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email")
      .toLowerCase()
      .trim(),

    otp: z
      .string({
        required_error: "OTP is required",
      })
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
  }),
});

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Reset password validation schema with OTP
 */
export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Please provide a valid email")
        .toLowerCase()
        .trim(),

      otp: z
        .string({
          required_error: "OTP is required",
        })
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),

      password: z
        .string({
          required_error: "Password is required",
        })
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
        ),

      confirmPassword: z
        .string({
          required_error: "Confirm password is required",
        })
        .min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  cookies: z
    .object({
      refreshToken: z
        .string({
          required_error: "Refresh token is required",
        })
        .min(1, "Refresh token is required"),
    })
    .optional(),
});
