import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { MovieRatingOutputDto } from './movie-rating-output.dto';

export class MovieRatingResponseDto {
  @ApiProperty({ type: MovieRatingOutputDto })
  data: MovieRatingOutputDto;
}

export class MovieRatingsListResponseDto {
  @ApiProperty({ type: [MovieRatingOutputDto] })
  data: MovieRatingOutputDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
