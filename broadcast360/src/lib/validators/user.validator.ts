import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .endsWith("@gmail.com", "Only Gmail accounts are allowed"),

  phone: z
    .string()
    .trim()
    .regex(/^09\d{7,9}$/, "Invalid Myanmar phone number")
    .optional(),

  avatar: z.string().url("Invalid avatar URL").optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password needs uppercase letter")
    .regex(/[a-z]/, "Password needs lowercase letter")
    .regex(/[0-9]/, "Password needs number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password needs special character"),

  role: z.enum(["ADMIN", "USER"]).default("USER"),

  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]).default("ACTIVE"),
});

export const publicRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .endsWith("@gmail.com", "Only Gmail accounts are allowed"),
  password: createUserSchema.shape.password,
  verificationCode: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
  acceptedPolicy: z.literal(true, { error: "You must accept the FlickScope policy" }),
  turnstileToken: z.string().min(1, "Cloudflare security check is required"),
});

export const updateUserSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]),
});
