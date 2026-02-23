import { PartialType } from '@nestjs/swagger';
import { CreateMovieRatingDto } from './create-movie-rating.dto';

export class UpdateMovieRatingDto extends PartialType(CreateMovieRatingDto) {}
