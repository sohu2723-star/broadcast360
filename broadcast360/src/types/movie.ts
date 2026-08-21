/* -------------------------
   FRONTEND FORM TYPE
--------------------------*/
export type MovieFormData = {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  video: File | null;
  thumbnail?: File | null;
  accessType: "FREE" | "PREMIUM";
};

/* -------------------------
   DATABASE / API TYPE
--------------------------*/
export type Movie = {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  videoUrl: string;
  thumbnail: string | null;
  duration: number | null;
  releaseYear: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  accessType?: "FREE" | "PREMIUM";
  standardVideoUrl?: string | null;
  hdVideoUrl?: string | null;
};

/* -------------------------
   PRISMA CREATE INPUT (SERVER ONLY)
--------------------------*/
export type MovieCreateInput = {
  title: string;
  description: string;
  genre: string;
  releaseYear: number;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  accessType?: "FREE" | "PREMIUM";
  standardVideoUrl?: string;
  hdVideoUrl?: string;
};

/* -------------------------
   UPDATE INPUT
--------------------------*/
export type MovieUpdateInput = {
  title?: string;
  description?: string;
  genre?: string;
  releaseYear?: number;
  thumbnail?: string;
  accessType?: "FREE" | "PREMIUM";
  standardVideoUrl?: string;
  hdVideoUrl?: string;
};

/* -------------------------
   PAGINATION TYPES
--------------------------*/
export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedMoviesResponse = {
  data: Movie[];
  pagination: Pagination;
};
