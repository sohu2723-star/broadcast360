export type Schedule = {
  id: number;

  channel: {
    id: number;
    name: string;
  };

  playlist: {
    id: number;
    name: string;
  };

  startTime: string;   // formatted for UI (e.g. "08:00")
  endTime: string | null;

  scheduleDate: string; // derived from startTime (YYYY-MM-DD)

  createdDate: string;  // createdAt from DB
};