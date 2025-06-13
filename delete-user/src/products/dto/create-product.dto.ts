import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe tener como máximo 2 decimales' },
  )
  @IsPositive()
  price: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  category?: string;
}
