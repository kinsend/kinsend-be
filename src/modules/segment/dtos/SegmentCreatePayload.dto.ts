/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { FILTERS_CONTACT, CONDITION } from '../interfaces/const';

export class Filter {
  @ApiProperty({
    example: 'Added This Week',
    required: false,
    type: String,
  })
  @IsIn(Object.values(FILTERS_CONTACT), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  key?: string;

  @ApiProperty({
    example: 2,
    required: false,
    type: Number,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({
    example: CONDITION.IS,
    required: false,
    enum: CONDITION,
    type: String,
  })
  @IsIn(Object.values(CONDITION), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  condition?: CONDITION;

  @ApiProperty({
    example: 2,
    required: false,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  day?: number;

  @ApiProperty({
    example: 'Jan',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  month?: string;

  @ApiProperty({
    example: 'Form ID',
    required: false,
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  formId?: string;

  @ApiProperty({
    example: 'Update ID',
    required: false,
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  updateId?: string;

  @ApiProperty({
    example: 'Tag ID or Tag IDs',
    required: false,
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  tagId?: string | string[];

  @ApiProperty({
    example: 'Segment ID',
    required: false,
    type: String,
  })
  @IsMongoId()
  @IsOptional()
  segmentId?: string;

  @ApiProperty({
    example: 'Input location',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  location?: string;
}

export class SegmentCreatePayload {
  @ApiProperty({
    example: 'Segment name',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    type: [[Filter]],
  })
  @IsArray({
    each: true,
  })
  filters: Filter[][];
}
