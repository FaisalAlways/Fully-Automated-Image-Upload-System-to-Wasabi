import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(15, "Phone number must be no more than 15 digits")
    .regex(
      /^\+?[0-9]+$/,
      "Phone number must contain only digits and may start with +"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be at most 32 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/,
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
