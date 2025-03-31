import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreatePointDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: BinaryType;
}
