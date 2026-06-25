import { MovieRepository } from '@/repositories/movie.repository';

const movieRepository = new MovieRepository();

export class MovieService {
  async getPaginatedMovies(page: number, limit: number) {
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, limit);

    const { data, total } = await movieRepository.findMany({
      page: validatedPage,
      limit: validatedLimit,
    });

    return {
      data,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
      },
    };
  }
}