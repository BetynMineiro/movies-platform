import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { ActorOutputDto } from '../../actors/dto/actor-output.dto';
import { MovieOutputDto } from './movie-output.dto';

export class MovieResponseDto {
  @ApiProperty({ type: MovieOutputDto })
  data: MovieOutputDto;
}

export class MoviesListResponseDto {
  @ApiProperty({ type: [MovieOutputDto] })
  data: MovieOutputDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class MovieActorsListResponseDto {
  @ApiProperty({ type: [ActorOutputDto] })
  data: ActorOutputDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
