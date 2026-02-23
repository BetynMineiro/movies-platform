import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Movie } from '../movies/entities/movie.entity';
import { Actor } from '../actors/entities/actor.entity';
import { MovieRating } from '../movie-ratings/entities/movie-rating.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Movie, Actor, MovieRating])],
  providers: [SeedService],
})
export class SeedModule {}
