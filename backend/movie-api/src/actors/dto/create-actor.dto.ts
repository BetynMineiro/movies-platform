import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateActorDto {
  @ApiProperty({ example: 'Morgan Freeman' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'American' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nationality: string;
}
