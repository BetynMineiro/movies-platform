import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Movie } from '../movies/entities/movie.entity';
import { Actor } from '../actors/entities/actor.entity';
import { MovieRating } from '../movie-ratings/entities/movie-rating.entity';

interface SeedActor {
  name: string;
  nationality: string;
}

interface SeedRating {
  score: number;
  comment: string;
}

interface SeedMovie {
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
  actorNames: string[];
  ratings: SeedRating[];
}

interface SyntheticMoviesConfig {
  count: number;
  baseYear: number;
  maxYear?: number;
  minActorsPerMovie?: number;
  maxActorsPerMovie?: number;
  ratingsPerMovie?: number;
  genres: string[];
  ratingComments: SeedRating[];
}

interface SeedData {
  actors: SeedActor[];
  movies?: SeedMovie[];
  syntheticMovies: SyntheticMoviesConfig;
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
    @InjectRepository(MovieRating)
    private readonly ratingsRepository: Repository<MovieRating>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
    await this.seedSampleData();
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      await this.usersService.create(adminEmail, 'Admin@123', 'admin');
      this.logger.log('Admin user created successfully');
    } else {
      this.logger.log('Admin user already exists');
    }
  }

  private async seedSampleData() {
    const seedData = this.loadSeedData();
    const sampleActors = seedData.actors;
    const sampleMovies = [
      ...(seedData.movies ?? []),
      ...this.buildSyntheticMovies(seedData),
    ];

    const actorMap = new Map<string, Actor>();

    for (const actorData of sampleActors) {
      let actor = await this.actorsRepository.findOne({
        where: { name: actorData.name },
      });

      if (!actor) {
        actor = this.actorsRepository.create(actorData);
        actor = await this.actorsRepository.save(actor);
      }

      actorMap.set(actor.name, actor);
    }

    const movieMap = new Map<string, Movie>();

    for (const movieData of sampleMovies) {
      let movie = await this.moviesRepository.findOne({
        where: { title: movieData.title },
        relations: ['actors'],
      });

      const actors = movieData.actorNames
        .map((actorName) => actorMap.get(actorName))
        .filter((actor): actor is Actor => Boolean(actor));

      if (!movie) {
        movie = this.moviesRepository.create({
          title: movieData.title,
          description: movieData.description,
          releaseYear: movieData.releaseYear,
          genre: movieData.genre,
          actors,
        });
      } else {
        movie.actors = actors;
      }

      movie = await this.moviesRepository.save(movie);
      movieMap.set(movie.title, movie);
    }

    for (const movieData of sampleMovies) {
      const movie = movieMap.get(movieData.title);

      if (!movie) {
        continue;
      }

      for (const rating of movieData.ratings) {
        await this.createRatingIfMissing(
          movie.id,
          rating.score,
          rating.comment,
        );
      }
    }

    this.logger.log(
      `Sample dataset seeded successfully: ${sampleActors.length} actors, ${sampleMovies.length} movies`,
    );
  }

  private async createRatingIfMissing(
    movieId: number,
    score: number,
    comment: string,
  ) {
    const existingRating = await this.ratingsRepository.findOne({
      where: { movieId, score, comment },
    });

    if (!existingRating) {
      const rating = this.ratingsRepository.create({ movieId, score, comment });
      await this.ratingsRepository.save(rating);
    }
  }

  private loadSeedData(): SeedData {
    const fileCandidates = [
      join(process.cwd(), 'src', 'seed', 'data', 'seed-data.json'),
      join(process.cwd(), 'dist', 'seed', 'data', 'seed-data.json'),
    ];

    const filePath = fileCandidates.find((candidate) => existsSync(candidate));

    if (!filePath) {
      throw new Error(
        'seed-data.json not found in src/seed/data or dist/seed/data',
      );
    }

    const rawContent = readFileSync(filePath, 'utf-8');
    return JSON.parse(rawContent) as SeedData;
  }

  private buildSyntheticMovies(seedData: SeedData): SeedMovie[] {
    const syntheticMovies: SeedMovie[] = [];
    const actorNames = seedData.actors.map((actor) => actor.name);
    const {
      count,
      baseYear,
      maxYear,
      minActorsPerMovie = 2,
      maxActorsPerMovie = 4,
      ratingsPerMovie = 2,
      genres,
      ratingComments,
    } = seedData.syntheticMovies;

    const effectiveMaxYear = maxYear ?? baseYear + 45;

    for (let index = 1; index <= count; index++) {
      const title = `Seed Movie ${String(index).padStart(3, '0')}`;
      const releaseYear = this.randomInt(
        baseYear,
        effectiveMaxYear,
        index * 17,
      );
      const genre = genres[this.randomInt(0, genres.length - 1, index * 19)];

      const desiredActorCount = this.randomInt(
        minActorsPerMovie,
        Math.min(maxActorsPerMovie, actorNames.length),
        index * 23,
      );

      const uniqueActors = this.pickUniqueActors(
        actorNames,
        desiredActorCount,
        index * 29,
      );

      const ratings: SeedRating[] = [];

      for (
        let ratingIndex = 0;
        ratingIndex < Math.max(1, ratingsPerMovie);
        ratingIndex++
      ) {
        const ratingTemplate =
          ratingComments[
            this.randomInt(
              0,
              ratingComments.length - 1,
              index * 37 + ratingIndex,
            )
          ];
        const scoreVariance = this.randomInt(-1, 1, index * 31 + ratingIndex);
        const score = Math.min(
          10,
          Math.max(0, ratingTemplate.score + scoreVariance),
        );

        ratings.push({
          score,
          comment: ratingTemplate.comment,
        });
      }

      syntheticMovies.push({
        title,
        description: `Auto-generated movie dataset entry ${index} for testing and navigation.`,
        releaseYear,
        genre,
        actorNames: uniqueActors,
        ratings,
      });
    }

    return syntheticMovies;
  }

  private pickUniqueActors(
    actorNames: string[],
    count: number,
    seed: number,
  ): string[] {
    const selected = new Set<string>();
    let offset = 0;

    while (selected.size < count) {
      const index = this.randomInt(
        0,
        actorNames.length - 1,
        seed + offset * 13,
      );
      selected.add(actorNames[index]);
      offset++;
    }

    return Array.from(selected);
  }

  private randomInt(min: number, max: number, seed: number): number {
    const x = Math.sin(seed * 9999) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  }
}
