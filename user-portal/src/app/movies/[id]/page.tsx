import { notFound } from "next/navigation";

import { getMovieDetail } from "@/services/movie.service";

import MovieDetail from "@/components/movie-detail/MovieDetail";


interface PageProps {
  params: Promise<{
    id:string;
  }>;
}


export default async function MovieDetailPage({
  params
}:PageProps){


  const {id}=await params;


  const data = await getMovieDetail(id);



  if(!data.movie){
    notFound();
  }



  return (

    <MovieDetail

      movie={data.movie}

      playlist={data.playlist}

      relatedMovies={data.relatedMovies}

    />

  );
}