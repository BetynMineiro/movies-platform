import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { Actor } from './entities/actor.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { QueryActorsDto } from './dto/query-actors.dto';
import { AppLoggerService } from '../common/services/app-logger.service';

describe('ActorsService', () => {
  let service: ActorsService;
  let repository: jest.Mocked<Repository<Actor>>;

  const mockActor: Actor = {
    id: 1,
    name: 'Morgan Freeman',
    nationality: 'American',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: getRepositoryToken(Actor),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
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

    service = module.get<ActorsService>(ActorsService);
    repository = module.get(getRepositoryToken(Actor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated actors without filter', async () => {
      const actors = [mockActor];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(actors),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryActorsDto = { limit: 10 };
      const result = await service.findAll(query);

      expect(result.data).toEqual(actors);
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

    it('should return paginated actors with name filter', async () => {
      const actors = [mockActor];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(actors),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryActorsDto = { name: 'Morgan', limit: 10 };
      await service.findAll(query);

      expect(dataQueryBuilder.andWhere).toHaveBeenCalledWith(
        'actor.name LIKE :name',
        {
          name: '%Morgan%',
        },
      );
    });

    it('should return actors with cursor for next page', async () => {
      const actor2 = { ...mockActor, id: 2, name: 'Actor 2' };
      const actors = [mockActor, actor2];
      const totalQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };
      const dataQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(actors),
      };

      (repository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce(totalQueryBuilder)
        .mockReturnValueOnce(dataQueryBuilder);

      const query: QueryActorsDto = { limit: 1 };
      const result = await service.findAll(query);

      expect(result.meta?.hasNext).toBe(true);
      expect(result.meta?.hasNextPage).toBe(true);
      expect(result.meta?.hasPreviousPage).toBe(false);
      expect(result.meta?.totalPages).toBe(2);
      expect(result.meta?.nextCursor).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an actor when found', async () => {
      repository.findOne.mockResolvedValue(mockActor);

      const result = await service.findOne(1);

      expect(result).toEqual(mockActor);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when actor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an actor', async () => {
      const createDto: CreateActorDto = {
        name: 'Al Pacino',
        nationality: 'American',
      };

      repository.create.mockReturnValue(mockActor);
      repository.save.mockResolvedValue(mockActor);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockActor);
      expect(result).toEqual(mockActor);
    });
  });

  describe('update', () => {
    it('should update and return an actor', async () => {
      const updateDto: UpdateActorDto = { name: 'Updated Name' };
      const updatedActor = { ...mockActor, ...updateDto };

      repository.findOne.mockResolvedValue(mockActor);
      repository.save.mockResolvedValue(updatedActor);

      const result = await service.update(1, updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when actor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an actor', async () => {
      repository.findOne.mockResolvedValue(mockActor);
      repository.remove.mockResolvedValue(mockActor);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockActor);
    });

    it('should throw NotFoundException when actor not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
