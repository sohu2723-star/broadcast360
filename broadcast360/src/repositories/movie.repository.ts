import { prisma } from "@/lib/prisma";

export function getMovies() {
  return prisma.movie.findMany();
}

export function getMovieById(id: number) {
  return prisma.movie.findUnique({
    where: { id },
  });
}

export function createMovie(data: {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
}) {
  return prisma.movie.create({
    data,
  });
}

export function updateMovie(
  id:number,
  data:{
    title:string;
    description:string;
    releaseYear:number;
  }
    ){

    return prisma.movie.update({
    where:{id},data
    });

}

export function deleteMovie(id: number) {
  return prisma.movie.delete({
    where: { id },
  });
}