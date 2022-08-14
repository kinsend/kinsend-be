import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { UPDATE_PROGRESS } from '../interfaces/const';

export class UpdateFindQueryQueryDto {
  @ApiProperty({ example: 'Search any thing', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: UPDATE_PROGRESS.SCHEDULED, required: false })
  @IsOptional()
  @IsString()
  progress?: UPDATE_PROGRESS;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;
}
