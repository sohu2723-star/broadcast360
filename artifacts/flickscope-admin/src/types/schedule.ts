export enum ScheduleStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type ScheduleFormData = {
  channelId: number;
  playlistId: number;
  startTime: string;
  endTime: string;
};

export type CreateScheduleDTO = ScheduleFormData;

export type UpdateScheduleDTO = ScheduleFormData & {
  status?: ScheduleStatus;
};