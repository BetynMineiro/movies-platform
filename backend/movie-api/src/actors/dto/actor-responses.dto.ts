import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { MovieOutputDto } from '../../movies/dto/movie-output.dto';
import { ActorOutputDto } from './actor-output.dto';

export class ActorResponseDto {
  @ApiProperty({ type: ActorOutputDto })
  data: ActorOutputDto;
}

export class ActorsListResponseDto {
  @ApiProperty({ type: [ActorOutputDto] })
  data: ActorOutputDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class ActorMoviesListResponseDto {
  @ApiProperty({ type: [MovieOutputDto] })
  data: MovieOutputDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
