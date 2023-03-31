import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Filter } from '../../segment/dtos/SegmentCreatePayload.dto';
import { CONDITION } from '../../segment/interfaces/const';

export class MessageFindQueryQueryDto {
  @ApiProperty({ example: 'Search any thing', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 1, required: false })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiProperty({ example: 10, required: false })
  @IsString()
  @IsOptional()
  pageSize?: string;
}

export class MessageFindDto {
  @ApiProperty({
    required: false,
    type: [[Filter]],
  })
  @IsArray({
    each: true,
  })
  @ValidateNested()
  @Type(() => Filter)
  @IsOptional()
  filters?: Filter[][];
}
