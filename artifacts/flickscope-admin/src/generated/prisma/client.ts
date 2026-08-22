export const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AccessType = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
} as const;
export type AccessType = (typeof AccessType)[keyof typeof AccessType];

export const SubscriptionStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PaymentMethod = { KPAY: "KPAY" } as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const StreamProtocol = {
  RTSP: "RTSP",
  RTMP: "RTMP",
  HLS: "HLS",
  WEBRTC: "WEBRTC",
} as const;
export type StreamProtocol = (typeof StreamProtocol)[keyof typeof StreamProtocol];

export const StreamStatus = { ONLINE: "ONLINE", OFFLINE: "OFFLINE" } as const;
export type StreamStatus = (typeof StreamStatus)[keyof typeof StreamStatus];

export const ProgramType = {
  MOVIE: "MOVIE",
  SERIES: "SERIES",
  NEWS: "NEWS",
  LIVE: "LIVE",
  ENTERTAINMENT: "ENTERTAINMENT",
} as const;
export type ProgramType = (typeof ProgramType)[keyof typeof ProgramType];

export const PlaylistItemType = {
  MOVIE: "MOVIE",
  EPISODE: "EPISODE",
  ADVERTISEMENT: "ADVERTISEMENT",
  ENTERTAINMENT: "ENTERTAINMENT",
  NEWS: "NEWS",
  STREAM: "STREAM",
} as const;
export type PlaylistItemType = (typeof PlaylistItemType)[keyof typeof PlaylistItemType];

export const ScheduleStatus = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export const BroadcastStatus = {
  STARTING: "STARTING",
  LIVE: "LIVE",
  SWITCHING: "SWITCHING",
  STOPPING: "STOPPING",
  STOPPED: "STOPPED",
  ERROR: "ERROR",
} as const;
export type BroadcastStatus = (typeof BroadcastStatus)[keyof typeof BroadcastStatus];

export const AdvertisementEventType = {
  IMPRESSION: "IMPRESSION",
  COMPLETE: "COMPLETE",
  CLICK: "CLICK",
} as const;
export type AdvertisementEventType = (typeof AdvertisementEventType)[keyof typeof AdvertisementEventType];

export const ContactMessageStatus = {
  NEW: "NEW",
  READ: "READ",
  RESOLVED: "RESOLVED",
} as const;
export type ContactMessageStatus = (typeof ContactMessageStatus)[keyof typeof ContactMessageStatus];

export const SupportConversationStatus = { OPEN: "OPEN", CLOSED: "CLOSED" } as const;
export type SupportConversationStatus = (typeof SupportConversationStatus)[keyof typeof SupportConversationStatus];

export const SupportSenderRole = { USER: "USER", ADMIN: "ADMIN" } as const;
export type SupportSenderRole = (typeof SupportSenderRole)[keyof typeof SupportSenderRole];

export const ReactivationRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type ReactivationRequestStatus = (typeof ReactivationRequestStatus)[keyof typeof ReactivationRequestStatus];

export namespace Prisma {
  export type UserSelect = Record<string, boolean | object>;
  export type UserWhereInput = Record<string, unknown>;
  export type UserCreateInput = Record<string, unknown>;
  export type UserUpdateInput = Record<string, unknown>;
  export type UserOrderByWithRelationInput = Record<string, unknown>;
  export type PaymentWhereInput = Record<string, unknown>;
  export type ScheduleWhereInput = Record<string, unknown>;
  export type StreamWhereInput = Record<string, unknown>;
  export type BroadcastSessionCreateInput = Record<string, unknown>;
  export type PlaylistItemGetPayload<T = unknown> = any;
  export type ScheduleGetPayload<T = unknown> = any;

  export class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: unknown;
    constructor(message: string, options: { code?: string; meta?: unknown } = {}) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = options.code ?? "P0001";
      this.meta = options.meta;
    }
  }
}

export type PrismaClient = unknown;
