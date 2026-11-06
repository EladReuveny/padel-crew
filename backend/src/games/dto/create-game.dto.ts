import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MinDate } from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  location!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date(), { message: 'Date must be in the present or future.' })
  date?: Date;
}
