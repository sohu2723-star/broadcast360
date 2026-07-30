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
