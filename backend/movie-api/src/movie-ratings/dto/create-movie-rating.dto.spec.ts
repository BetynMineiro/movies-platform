import { validate } from 'class-validator';
import { CreateMovieRatingDto } from './create-movie-rating.dto';

describe('CreateMovieRatingDto', () => {
  const buildDto = (score: number) => {
    const dto = new CreateMovieRatingDto();
    dto.score = score;
    dto.movieId = 1;
    dto.comment = 'Good';
    return dto;
  };

  it('accepts score 0', async () => {
    const dto = buildDto(0);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts score 10', async () => {
    const dto = buildDto(10);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects score below 0', async () => {
    const dto = buildDto(-1);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects score above 10', async () => {
    const dto = buildDto(11);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
