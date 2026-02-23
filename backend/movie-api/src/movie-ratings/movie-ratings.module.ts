import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { MovieRating } from './entities/movie-rating.entity';
import { MovieRatingsController } from './movie-ratings.controller';
import { MovieRatingsService } from './movie-ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovieRating, Movie])],
  controllers: [MovieRatingsController],
  providers: [MovieRatingsService],
  exports: [MovieRatingsService],
})
export class MovieRatingsModule {}
