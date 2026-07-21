// src/types/entertainment.ts

export type EntertainmentFormData = {
  title: string;
  description: string;
  category: string;

  releaseYear: number | "";

  thumbnail?: File | null;
  video?: File | null;

duration: number;
};


export type Entertainment = {
  id: number;

  title: string;

  description: string | null;

  category: string | null;

  thumbnail: string | null;

  videoUrl: string | null;

  duration: number | null;

  releaseYear: number | null;

  createdAt: string;
};