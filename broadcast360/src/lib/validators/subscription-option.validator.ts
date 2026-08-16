import { z } from "zod";

export const createSubscriptionOptionSchema = z.object({
  planId: z.number().int().positive(),

  durationDays: z.number().int().positive(),

  price: z.number().nonnegative(),

  discountPercent: z
    .number()
    .min(0)
    .max(100),

  isActive: z.boolean().optional(),
});

export const updateSubscriptionOptionSchema = z.object({
  durationDays: z
    .number()
    .int()
    .positive()
    .optional(),

  price: z
    .number()
    .nonnegative()
    .optional(),

  discountPercent: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  isActive: z.boolean().optional(),
});