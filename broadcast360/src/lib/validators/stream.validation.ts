import { z } from "zod";

import {
  StreamProtocol,
  StreamStatus,
} from "@/generated/prisma/client";

export const createStreamSchema = z.object({
  channelId: z
    .number({
      message: "Channel is required",
    })
    .int()
    .positive(),

  name: z
    .string({
      message: "Stream name is required",
    })
    .trim()
    .min(
      2,
      "Stream name must be at least 2 characters"
    ),

  protocol: z.enum(StreamProtocol),

  description: z
    .string()
    .max(255)
    .nullable()
    .optional(),
});

export const updateStreamSchema = z.object({
  channelId: z
    .number()
    .int()
    .positive()
    .optional(),

  name: z
    .string()
    .trim()
    .min(
      2,
      "Stream name must be at least 2 characters"
    )
    .optional(),

  protocol: z
    .enum(StreamProtocol)
    .optional(),

  status: z
    .enum(StreamStatus)
    .optional(),

  description: z
    .string()
    .max(255)
    .nullable()
    .optional(),
});