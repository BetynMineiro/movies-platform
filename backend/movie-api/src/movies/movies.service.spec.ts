import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Actor } from '../actors/entities/actor.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { AppLoggerService } from '../common/services/app-logger.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: jest.Mocked<Repository<Movie>>;
  let logger: jest.Mocked<AppLoggerService>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    description: 'Test Description',
    releaseYear: 2023,
    genre: 'Action',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Actor),
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

    service = module.get<MoviesService>(MoviesService);
    repository = module.get(getRepositoryToken(Movie));
    logger = module.get(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated movies without filter', async () => {
      const movies = [mockMovie];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movies),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryMoviesDto = { limit: 10 };
      const result = await service.findAll(query);

      expect(result.data).toEqual(movies);
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

    it('should return paginated movies with title filter', async () => {
      const movies = [mockMovie];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movies),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryMoviesDto = { title: 'Test', limit: 10 };
      await service.findAll(query);

      expect(dataQueryBuilder.andWhere).toHaveBeenCalledWith(
        'movie.title LIKE :title',
        { title: '%Test%' },
      );
    });

    it('should return movies with cursor for next page', async () => {
      const movie2 = { ...mockMovie, id: 2, title: 'Movie 2' };
      const movies = [mockMovie, movie2];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movies),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryMoviesDto = { limit: 1 };
      const result = await service.findAll(query);

      expect(result.meta?.hasNext).toBe(true);
      expect(result.meta?.hasNextPage).toBe(true);
      expect(result.meta?.hasPreviousPage).toBe(false);
      expect(result.meta?.totalPages).toBe(2);
      expect(result.meta?.nextCursor).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a movie when found', async () => {
      repository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovie);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when movie not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a movie', async () => {
      const createDto: CreateMovieDto = {
        title: 'New Movie',
        description: 'New Description',
        releaseYear: 2024,
        genre: 'Drama',
      };

      repository.create.mockReturnValue(mockMovie);
      repository.save.mockResolvedValue(mockMovie);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });
  });

  describe('update', () => {
    it('should update and return a movie', async () => {
      const updateDto: UpdateMovieDto = { title: 'Updated Title' };
      const updatedMovie = { ...mockMovie, ...updateDto };

      repository.findOne.mockResolvedValue(mockMovie);
      repository.save.mockResolvedValue(updatedMovie);

      const result = await service.update(1, updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when movie not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a movie', async () => {
      repository.findOne.mockResolvedValue(mockMovie);
      repository.remove.mockResolvedValue(mockMovie);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw NotFoundException when movie not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
