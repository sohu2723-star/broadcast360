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
    .min(2, "Stream name must be at least 2 characters"),

  url: z
    .string({
      message: "Stream URL is required",
    })
    .min(5, "Invalid stream URL"),

  protocol: z.enum(["RTSP", "RTMP", "HLS", "WEBRTC", "SRT"]),

  description: z.string().max(255).nullable().optional(),
});

export const updateStreamSchema = z.object({
  name: z.string().min(2).optional(),

  channelId:z.number().optional(),

  url: z.string().min(5).optional(),

  protocol: z.enum(["RTSP", "RTMP", "HLS", "WEBRTC", "SRT"]).optional(),

  status: z.enum(["ONLINE", "OFFLINE", "ERROR"]).optional(),

  description: z.string().max(255).nullable().optional(),
});
