import { z } from "zod";



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

  protocol: z.enum(['RTSP', 'RTMP', 'HLS', 'WEBRTC']),

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
    .enum(["RTSP", "RTMP", "HLS", "WEBRTC"])
    .optional(),

  status: z
    .enum(["ONLINE", "OFFLINE"])
    .optional(),

  description: z
    .string()
    .max(255)
    .nullable()
    .optional(),
});