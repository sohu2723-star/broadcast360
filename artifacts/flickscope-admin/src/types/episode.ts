export type EpisodeFormData = {
  title: string;
  episodeNo: number;

  videoFile: File | null;
  thumbnailFile: File | null;
  accessType: "FREE" | "PREMIUM";
};
export type Episode = {
  id: number;
  seriesId: number;
  title: string;
  episodeNo: number;
  duration: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  accessType?: "FREE" | "PREMIUM";
  createdAt: Date | string;
};

//  API UPDATE TYPE (clean + correct)
export type EpisodeUpdateData = {
  title: string;
  episodeNo: number;
  videoFile?: File | null; //  optional + nullable (edit-safe)
  thumbnailFile?: File | null;
  accessType?: "FREE" | "PREMIUM";
};