export type EpisodeFormData = {
  title: string;
  episodeNo: number;
  videoFile: File | null; // ✅ always defined in form state
  thumbnailFile: File | null;

};

export type Episode = {
  id: number;
  seriesId: number;
  title: string;
  episodeNo: number;
  duration: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date | string;
};

// ✅ API UPDATE TYPE (clean + correct)
export type EpisodeUpdateData = {
  title: string;
  episodeNo: number;
  videoFile?: File | null; // ✅ optional + nullable (edit-safe)
  thumbnailFile?: File | null; 
};