/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { Filter } from './SegmentCreatePayload.dto';

export class SegmentUpdatePayload {
  @ApiProperty({
    example: 'Segment name',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    type: [[Filter]],
  })
  @IsArray({
    each: true,
  })
  filters?: Filter[][];
}
