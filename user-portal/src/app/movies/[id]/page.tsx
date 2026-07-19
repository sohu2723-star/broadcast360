import { notFound } from "next/navigation";

import PlaybackLayout from "@/components/movie-playback/PlaybackLayout";
import { getMovies } from "@/services/movie.service";

import type { Movie } from "@/types/movie";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function MoviePlaybackPage({
  params,
}: PageProps) {

  const { id } = await params;


  const movies: Movie[] = await getMovies();



  // Find exact movie by movieKey
  const movie = movies.find(
    (item) => item.movieKey === id
  );



  if (!movie) {
    notFound();
  }



  // Same channel related movies
  const relatedMovies = movies.filter(
    (item) =>
      item.movieKey !== movie.movieKey &&
      item.channelId === movie.channelId
  );



  return (
    <PlaybackLayout
      movie={movie}
      relatedMovies={relatedMovies}
    />
  );
}