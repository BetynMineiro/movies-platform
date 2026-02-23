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
import { CreateMovieRatingDto } from './dto/create-movie-rating.dto';
import { QueryMovieRatingsDto } from './dto/query-movie-ratings.dto';
import { UpdateMovieRatingDto } from './dto/update-movie-rating.dto';
import { MovieRating } from './entities/movie-rating.entity';
import { MovieRatingsService } from './movie-ratings.service';

@ApiTags('Movie Ratings')
@ApiBearerAuth()
@Controller('movie-ratings')
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all movie ratings with pagination and optional movie filter',
  })
  @ApiOkResponse({ description: 'Returns paginated movie ratings list' })
  async findAll(
    @Query() query: QueryMovieRatingsDto,
  ): Promise<ApiResponse<MovieRating[]>> {
    return this.movieRatingsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie rating by ID' })
  @ApiOkResponse({ description: 'Returns a single movie rating' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<MovieRating>> {
    const data = await this.movieRatingsService.findOne(id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new movie rating' })
  @ApiCreatedResponse({ description: 'Movie rating created successfully' })
  async create(
    @Body() createDto: CreateMovieRatingDto,
  ): Promise<ApiResponse<MovieRating>> {
    const data = await this.movieRatingsService.create(createDto);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update movie rating by ID' })
  @ApiOkResponse({ description: 'Movie rating updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMovieRatingDto,
  ): Promise<ApiResponse<MovieRating>> {
    const data = await this.movieRatingsService.update(id, updateDto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete movie rating by ID' })
  @ApiNoContentResponse({ description: 'Movie rating deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.movieRatingsService.remove(id);
  }
}
