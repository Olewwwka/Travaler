import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  text: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  authorPhoto?: string;
} 