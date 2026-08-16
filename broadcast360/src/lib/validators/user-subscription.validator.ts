import { z } from "zod";

export const createUserSubscriptionSchema = z.object({
  optionId: z.number().int().positive(),
});