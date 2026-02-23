import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { MovieRatingsModule } from './movie-ratings/movie-ratings.module';
import { SeedModule } from './seed/seed.module';
import { HealthCheckModule } from './healthcheck/healthcheck.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
    ActorsModule,
    MovieRatingsModule,
    SeedModule,
    HealthCheckModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
