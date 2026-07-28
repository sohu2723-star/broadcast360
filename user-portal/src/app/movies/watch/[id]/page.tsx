import { notFound } from "next/navigation";

import { getWatchMovie } from "@/services/movie.service";

import PlaybackLayout from "@/components/movie-detail/playback/PlaybackLayout";

import type { Movie } from "@/types/movie";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;

  const data = await getWatchMovie(id);

  if (!data?.movie) {
    notFound();
  }

  const movie: Movie = data.movie;

  const playlist: Movie[] = data.playlist ?? [];

  return (
    <PlaybackLayout
      movie={movie}

      playlist={playlist}
    />
  );
}
