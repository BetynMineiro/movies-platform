import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { Movie } from './entities/movie.entity';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: jest.Mocked<MoviesService>;

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
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const paginatedResponse = {
        data: [mockMovie],
        meta: {
          total: 1,
          limit: 10,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
          hasNext: false,
        },
      };

      service.findAll.mockResolvedValue(paginatedResponse);

      const query: QueryMoviesDto = { limit: 10 };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      service.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: mockMovie });
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

      service.create.mockResolvedValue(mockMovie);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({ data: mockMovie });
    });
  });

  describe('update', () => {
    it('should update and return a movie', async () => {
      const updateDto: UpdateMovieDto = { title: 'Updated Title' };
      const updatedMovie = { ...mockMovie, title: 'Updated Title' };

      service.update.mockResolvedValue(updatedMovie);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ data: updatedMovie });
    });
  });

  describe('remove', () => {
    it('should remove a movie', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
