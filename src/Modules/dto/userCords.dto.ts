import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCoordinatesDto {
  @IsNumber()
  latitude: number | null;

  @IsNumber()
  longitude: number | null;
}