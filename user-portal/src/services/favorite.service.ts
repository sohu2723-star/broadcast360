import authApi from "@/lib/authapi";

export interface Favorite {
  id: number;
  userId: number;

  movieId: number | null;
  episodeId: number | null;
  entertainmentId: number | null;
  newsId: number | null;

  createdAt: string;

  movie?: any;
  episode?: any;
  entertainment?: any;
  news?: any;
}

export type FavoriteContent =
  | { movieId: number }
  | { episodeId: number }
  | { entertainmentId: number }
  | { newsId: number };

// =====================================================
// GET FAVORITES
// =====================================================

export async function getFavorites(): Promise<Favorite[]> {
  const response = await authApi.get(
    "/api/user-portal/auth/favorites"
  );

  return response.data?.favorites ?? [];
}

// =====================================================
// ADD FAVORITE
// =====================================================

export async function addFavorite(
  content: FavoriteContent
) {
  const response = await authApi.post(
    "/api/user-portal/auth/favorites",
    content
  );

  return response.data;
}

// =====================================================
// REMOVE FAVORITE
// =====================================================

export async function removeFavorite(
  content: FavoriteContent
) {
  const response = await authApi.delete(
    "/api/user-portal/auth/favorites",
    {
      data: content,
    }
  );

  return response.data;
}

// =====================================================
// TOGGLE
// =====================================================

export async function toggleFavorite(
  content: FavoriteContent,
  currentlyFavorite: boolean
) {
  if (currentlyFavorite) {
    return removeFavorite(content);
  }

  return addFavorite(content);
}

// =====================================================
// CHECK
// =====================================================

export async function isFavorite(
  content: FavoriteContent
): Promise<boolean> {
  const favorites = await getFavorites();

  return favorites.some((favorite) => {
    if ("movieId" in content) {
      return favorite.movieId === content.movieId;
    }

    if ("episodeId" in content) {
      return favorite.episodeId === content.episodeId;
    }

    if ("entertainmentId" in content) {
      return (
        favorite.entertainmentId ===
        content.entertainmentId
      );
    }

    if ("newsId" in content) {
      return favorite.newsId === content.newsId;
    }

    return false;
  });
}