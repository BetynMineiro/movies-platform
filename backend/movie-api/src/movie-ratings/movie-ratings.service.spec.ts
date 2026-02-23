import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { AppLoggerService } from '../common/services/app-logger.service';
import { MovieRating } from './entities/movie-rating.entity';
import { MovieRatingsService } from './movie-ratings.service';

describe('MovieRatingsService', () => {
  let service: MovieRatingsService;
  let repository: jest.Mocked<Repository<MovieRating>>;

  const movie: Movie = {
    id: 1,
    title: 'Movie One',
    description: 'Description',
    releaseYear: 2024,
    genre: 'Drama',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const rating: MovieRating = {
    id: 1,
    score: 5,
    comment: 'Great',
    movie,
    movieId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieRatingsService,
        {
          provide: getRepositoryToken(MovieRating),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovieRatingsService>(MovieRatingsService);
    repository = module.get(getRepositoryToken(MovieRating));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns pagination metadata for first page', async () => {
      const totalQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };

      const dataQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([rating]),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const result = await service.findAll({ limit: 10 });

      expect(result.data).toEqual([rating]);
      expect(result.meta).toEqual({
        total: 1,
        limit: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        hasNext: false,
        nextCursor: undefined,
      });
    });

    it('returns next and previous flags in cursor pagination', async () => {
      const secondRating = { ...rating, id: 2 };

      const totalQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      const dataQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([rating, secondRating]),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const result = await service.findAll({ limit: 1, cursor: 999 });

      expect(result.meta?.hasPreviousPage).toBe(true);
      expect(result.meta?.hasNextPage).toBe(true);
      expect(result.meta?.totalPages).toBe(2);
      expect(result.meta?.nextCursor).toBe(1);
    });
  });
});
