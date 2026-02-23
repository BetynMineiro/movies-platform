import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.create('test@example.com', plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(repository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should create a user with custom role', async () => {
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      await service.create('admin@example.com', 'password', 'admin');

      expect(repository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(mockUser, 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(mockUser, 'wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.password,
      );
      expect(result).toBe(false);
    });
  });
});
