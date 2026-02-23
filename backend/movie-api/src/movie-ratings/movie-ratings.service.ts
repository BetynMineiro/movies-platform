import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { AppLoggerService } from '../common/services/app-logger.service';
import { Movie } from '../movies/entities/movie.entity';
import { CreateMovieRatingDto } from './dto/create-movie-rating.dto';
import { QueryMovieRatingsDto } from './dto/query-movie-ratings.dto';
import { UpdateMovieRatingDto } from './dto/update-movie-rating.dto';
import { MovieRating } from './entities/movie-rating.entity';

@Injectable()
export class MovieRatingsService {
  constructor(
    @InjectRepository(MovieRating)
    private readonly ratingsRepository: Repository<MovieRating>,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    private readonly logger: AppLoggerService,
  ) {}

  async findAll(
    query: QueryMovieRatingsDto,
  ): Promise<ApiResponse<MovieRating[]>> {
    const { movieId, limit = 10, cursor } = query;

    this.logger.log('Finding all movie ratings', 'MovieRatingsService', {
      filter: { movieId, limit, cursor },
    });

    const queryBuilder = this.ratingsRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.movie', 'movie')
      .orderBy('rating.id', 'DESC')
      .take(limit + 1);

    if (movieId) {
      queryBuilder.andWhere('rating.movieId = :movieId', { movieId });
    }

    if (cursor) {
      queryBuilder.andWhere('rating.id < :cursor', { cursor });
    }

    const ratings = await queryBuilder.getMany();
    const hasNext = ratings.length > limit;
    const data = hasNext ? ratings.slice(0, limit) : ratings;
    const nextCursor = hasNext ? data[data.length - 1].id : undefined;

    this.logger.log('Movie ratings found', 'MovieRatingsService', {
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

  async findOne(id: number): Promise<MovieRating> {
    this.logger.log('Finding movie rating by ID', 'MovieRatingsService', {
      id,
    });

    const rating = await this.ratingsRepository.findOne({
      where: { id },
      relations: ['movie'],
    });

    if (!rating) {
      this.logger.warn('Movie rating not found', 'MovieRatingsService', { id });
      throw new NotFoundException(`Movie rating with ID ${id} not found`);
    }

    return rating;
  }

  async create(createDto: CreateMovieRatingDto): Promise<MovieRating> {
    this.logger.log('Creating movie rating', 'MovieRatingsService', {
      movieId: createDto.movieId,
      score: createDto.score,
    });

    const movie = await this.moviesRepository.findOne({
      where: { id: createDto.movieId },
    });

    if (!movie) {
      this.logger.warn(
        'Movie not found for rating creation',
        'MovieRatingsService',
        {
          movieId: createDto.movieId,
        },
      );
      throw new NotFoundException(
        `Movie with ID ${createDto.movieId} not found`,
      );
    }

    const rating = this.ratingsRepository.create(createDto);
    const savedRating = await this.ratingsRepository.save(rating);

    this.logger.log(
      'Movie rating created successfully',
      'MovieRatingsService',
      {
        id: savedRating.id,
        movieId: savedRating.movieId,
        score: savedRating.score,
      },
    );

    return this.findOne(savedRating.id);
  }

  async update(
    id: number,
    updateDto: UpdateMovieRatingDto,
  ): Promise<MovieRating> {
    this.logger.log('Updating movie rating', 'MovieRatingsService', {
      id,
      updates: updateDto,
    });

    const rating = await this.findOne(id);

    if (updateDto.movieId && updateDto.movieId !== rating.movieId) {
      const movie = await this.moviesRepository.findOne({
        where: { id: updateDto.movieId },
      });

      if (!movie) {
        throw new NotFoundException(
          `Movie with ID ${updateDto.movieId} not found`,
        );
      }
    }

    Object.assign(rating, updateDto);

    const updatedRating = await this.ratingsRepository.save(rating);

    this.logger.log(
      'Movie rating updated successfully',
      'MovieRatingsService',
      {
        id: updatedRating.id,
        movieId: updatedRating.movieId,
        score: updatedRating.score,
      },
    );

    return this.findOne(updatedRating.id);
  }

  async remove(id: number): Promise<void> {
    this.logger.log('Removing movie rating', 'MovieRatingsService', { id });

    const rating = await this.findOne(id);
    await this.ratingsRepository.remove(rating);

    this.logger.log(
      'Movie rating removed successfully',
      'MovieRatingsService',
      {
        id,
        movieId: rating.movieId,
      },
    );
  }
}
