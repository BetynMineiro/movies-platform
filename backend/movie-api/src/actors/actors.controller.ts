import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { QueryActorsDto } from './dto/query-actors.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { Actor } from './entities/actor.entity';
import { Movie } from '../movies/entities/movie.entity';
import { QueryMoviesDto } from '../movies/dto/query-movies.dto';
import {
  ActorMoviesListResponseDto,
  ActorResponseDto,
  ActorsListResponseDto,
} from './dto/actor-responses.dto';

@ApiTags('Actors')
@ApiBearerAuth()
@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all actors with pagination and optional filter',
  })
  @ApiOkResponse({
    description: 'Returns paginated actors list',
    type: ActorsListResponseDto,
  })
  async findAll(@Query() query: QueryActorsDto): Promise<ApiResponse<Actor[]>> {
    return this.actorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get actor by ID' })
  @ApiOkResponse({
    description: 'Returns a single actor',
    type: ActorResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Actor>> {
    const data = await this.actorsService.findOne(id);
    return { data };
  }

  @Get(':id/movies')
  @ApiOperation({ summary: 'Get all movies for an actor' })
  @ApiOkResponse({
    description: 'Returns movies for an actor',
    type: ActorMoviesListResponseDto,
  })
  async getMoviesByActor(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryMoviesDto,
  ): Promise<ApiResponse<Movie[]>> {
    return this.actorsService.getMoviesByActor(id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new actor' })
  @ApiCreatedResponse({
    description: 'Actor created successfully',
    type: ActorResponseDto,
  })
  async create(
    @Body() createActorDto: CreateActorDto,
  ): Promise<ApiResponse<Actor>> {
    const data = await this.actorsService.create(createActorDto);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update actor by ID' })
  @ApiOkResponse({
    description: 'Actor updated successfully',
    type: ActorResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
  ): Promise<ApiResponse<Actor>> {
    const data = await this.actorsService.update(id, updateActorDto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete actor by ID' })
  @ApiNoContentResponse({ description: 'Actor deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.actorsService.remove(id);
  }
}
