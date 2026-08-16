import { z } from "zod";

export const createSubscriptionSchema = z.object({
  userId: z.number().int().positive(),
  planId: z.number().int().positive(),
  optionId: z.number().int().positive(),
});

export const updateSubscriptionSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACTIVE",
    "EXPIRED",
    "CANCELLED",
  ]).optional(),

  startDate: z.coerce.date().nullable().optional(),

  endDate: z.coerce.date().nullable().optional(),
});