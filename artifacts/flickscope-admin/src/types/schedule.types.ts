type Prisma = any;


export type ScheduleWithRelations = any;

export type PlaylistItemWithRelations =
  ScheduleWithRelations["playlist"]["items"][number];