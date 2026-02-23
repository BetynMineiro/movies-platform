import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { AppLoggerService } from '../common/services/app-logger.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { QueryActorsDto } from './dto/query-actors.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { Actor } from './entities/actor.entity';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
    private readonly logger: AppLoggerService,
  ) {}

  async findAll(query: QueryActorsDto): Promise<ApiResponse<Actor[]>> {
    const { name, limit = 10, cursor } = query;

    this.logger.log('Finding all actors', 'ActorsService', {
      filter: { name, limit, cursor },
    });

    const queryBuilder = this.actorsRepository
      .createQueryBuilder('actor')
      .orderBy('actor.id', 'DESC')
      .take(limit + 1);

    if (name) {
      queryBuilder.andWhere('actor.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (cursor) {
      queryBuilder.andWhere('actor.id < :cursor', { cursor });
    }

    const actors = await queryBuilder.getMany();
    const hasNext = actors.length > limit;
    const data = hasNext ? actors.slice(0, limit) : actors;
    const nextCursor = hasNext ? data[data.length - 1].id : undefined;

    this.logger.log('Actors found', 'ActorsService', {
      count: data.length,
      hasNext,
      nextCursor,
    });

    return {
      data,
      meta: {
        limit,
        hasNext,
        nextCursor,
      },
    };
  }

  async findOne(id: number): Promise<Actor> {
    this.logger.log('Finding actor by ID', 'ActorsService', { id });

    const actor = await this.actorsRepository.findOne({ where: { id } });

    if (!actor) {
      this.logger.warn('Actor not found', 'ActorsService', { id });
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }

    this.logger.log('Actor found', 'ActorsService', { id, name: actor.name });

    return actor;
  }

  async create(createActorDto: CreateActorDto): Promise<Actor> {
    this.logger.log('Creating new actor', 'ActorsService', {
      name: createActorDto.name,
      nationality: createActorDto.nationality,
    });

    const actor = this.actorsRepository.create(createActorDto);
    const savedActor = await this.actorsRepository.save(actor);

    this.logger.log('Actor created successfully', 'ActorsService', {
      id: savedActor.id,
      name: savedActor.name,
    });

    return savedActor;
  }

  async update(id: number, updateActorDto: UpdateActorDto): Promise<Actor> {
    this.logger.log('Updating actor', 'ActorsService', {
      id,
      updates: updateActorDto,
    });

    const actor = await this.findOne(id);
    const oldName = actor.name;

    Object.assign(actor, updateActorDto);

    const updatedActor = await this.actorsRepository.save(actor);

    this.logger.log('Actor updated successfully', 'ActorsService', {
      id,
      oldName,
      newName: updatedActor.name,
    });

    return updatedActor;
  }

  async remove(id: number): Promise<void> {
    this.logger.log('Removing actor', 'ActorsService', { id });

    const actor = await this.findOne(id);
    const name = actor.name;

    await this.actorsRepository.remove(actor);

    this.logger.log('Actor removed successfully', 'ActorsService', {
      id,
      name,
    });
  }
}
