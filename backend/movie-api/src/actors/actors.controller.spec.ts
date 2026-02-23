import { Test, TestingModule } from '@nestjs/testing';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { QueryActorsDto } from './dto/query-actors.dto';
import { Actor } from './entities/actor.entity';

describe('ActorsController', () => {
  let controller: ActorsController;
  let service: jest.Mocked<ActorsService>;

  const mockActor: Actor = {
    id: 1,
    name: 'Morgan Freeman',
    nationality: 'American',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActorsController],
      providers: [
        {
          provide: ActorsService,
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

    controller = module.get<ActorsController>(ActorsController);
    service = module.get(ActorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated actors', async () => {
      const paginatedResponse = {
        data: [mockActor],
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

      const query: QueryActorsDto = { limit: 10 };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single actor', async () => {
      service.findOne.mockResolvedValue(mockActor);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ data: mockActor });
    });
  });

  describe('create', () => {
    it('should create and return an actor', async () => {
      const createDto: CreateActorDto = {
        name: 'Al Pacino',
        nationality: 'American',
      };

      service.create.mockResolvedValue(mockActor);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({ data: mockActor });
    });
  });

  describe('update', () => {
    it('should update and return an actor', async () => {
      const updateDto: UpdateActorDto = { name: 'Updated Name' };
      const updatedActor = { ...mockActor, name: 'Updated Name' };

      service.update.mockResolvedValue(updatedActor);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ data: updatedActor });
    });
  });

  describe('remove', () => {
    it('should remove an actor', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
