import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Plan name is required")
    .max(100, "Plan name is too long"),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});

export const updateSubscriptionPlanSchema =
  createSubscriptionPlanSchema;