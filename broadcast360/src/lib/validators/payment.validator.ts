import { z } from "zod";

export const createPaymentSchema = z.object({
  subscriptionId: z.number().int().positive(),

  method: z.enum(["KPAY"]),

  transactionId: z
    .string()
    .trim()
    .min(1, "Transaction ID is required"),

  screenshotUrl: z
    .string()
    .trim()
    .min(1, "Payment screenshot is required"),
});