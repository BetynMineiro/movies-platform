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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { ApiResponse } from '../common/interfaces/api-response.interface';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { QueryMoviesDto } from './dto/query-movies.dto';
import { Movie } from './entities/movie.entity';

@ApiTags('Movies')
@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all movies with pagination and optional filter',
  })
  @ApiOkResponse({ description: 'Returns paginated movies list' })
  async findAll(@Query() query: QueryMoviesDto): Promise<ApiResponse<Movie[]>> {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie by ID' })
  @ApiOkResponse({ description: 'Returns a single movie' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Movie>> {
    const data = await this.moviesService.findOne(id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiCreatedResponse({ description: 'Movie created successfully' })
  async create(
    @Body() createMovieDto: CreateMovieDto,
  ): Promise<ApiResponse<Movie>> {
    const data = await this.moviesService.create(createMovieDto);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update movie by ID' })
  @ApiOkResponse({ description: 'Movie updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<ApiResponse<Movie>> {
    const data = await this.moviesService.update(id, updateMovieDto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete movie by ID' })
  @ApiNoContentResponse({ description: 'Movie deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.moviesService.remove(id);
  }
}
