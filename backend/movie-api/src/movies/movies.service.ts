import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { AppLoggerService } from '../common/services/app-logger.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly logger: AppLoggerService,
  ) {}

  async findAll(query: QueryMoviesDto): Promise<ApiResponse<Movie[]>> {
    const { title, limit = 10, cursor } = query;

    this.logger.log('Finding all movies', 'MoviesService', {
      filter: { title, limit, cursor },
    });

    const queryBuilder = this.moviesRepository
      .createQueryBuilder('movie')
      .orderBy('movie.id', 'DESC')
      .take(limit + 1);

    if (title) {
      queryBuilder.andWhere('movie.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    if (cursor) {
      queryBuilder.andWhere('movie.id < :cursor', { cursor });
    }

    const movies = await queryBuilder.getMany();
    const hasNext = movies.length > limit;
    const data = hasNext ? movies.slice(0, limit) : movies;
    const nextCursor = hasNext ? data[data.length - 1].id : undefined;

    this.logger.log('Movies found', 'MoviesService', {
      count: data.length,
      hasNext,
      nextCursor,
    });

    return {
      data,
      meta: {
        limit,
        hasNext,
        nextCursor,
      },
    };
  }

  async findOne(id: number): Promise<Movie> {
    this.logger.log('Finding movie by ID', 'MoviesService', { id });

    const movie = await this.moviesRepository.findOne({ where: { id } });

    if (!movie) {
      this.logger.warn('Movie not found', 'MoviesService', { id });
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    this.logger.log('Movie found', 'MoviesService', { id, title: movie.title });
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    this.logger.log('Creating new movie', 'MoviesService', {
      title: createMovieDto.title,
      releaseYear: createMovieDto.releaseYear,
    });

    const movie = this.moviesRepository.create(createMovieDto);
    const savedMovie = await this.moviesRepository.save(movie);

    this.logger.log('Movie created successfully', 'MoviesService', {
      id: savedMovie.id,
      title: savedMovie.title,
    });

    return savedMovie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    this.logger.log('Updating movie', 'MoviesService', {
      id,
      updates: updateMovieDto,
    });

    const movie = await this.findOne(id);
    const oldTitle = movie.title;

    Object.assign(movie, updateMovieDto);

    const updatedMovie = await this.moviesRepository.save(movie);

    this.logger.log('Movie updated successfully', 'MoviesService', {
      id,
      oldTitle,
      newTitle: updatedMovie.title,
    });

    return updatedMovie;
  }

  async remove(id: number): Promise<void> {
    this.logger.log('Removing movie', 'MoviesService', { id });

    const movie = await this.findOne(id);
    const title = movie.title;

    await this.moviesRepository.remove(movie);

    this.logger.log('Movie removed successfully', 'MoviesService', {
      id,
      title,
    });
  }
}
