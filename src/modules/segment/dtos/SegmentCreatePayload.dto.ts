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
import { CONDITION, DATE_CONDITION, FILTERS_CONTACT, TEXT_CONDITION } from '../interfaces/const';

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
  title?: string;

  @ApiProperty({
    example: 2,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  numbers?: number;

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
    example: '+123456789',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phoneNumber?: string;

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
    example: DATE_CONDITION.ON,
    required: false,
    enum: DATE_CONDITION,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  dateCondition?: DATE_CONDITION;

  @ApiProperty({
    example: '07/17/2022',
    required: false,
    type: String,
  })
  @IsIn(Object.values(DATE_CONDITION), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: TEXT_CONDITION.STARTS_WITH,
    required: false,
    enum: TEXT_CONDITION,
    type: String,
  })
  @IsIn(Object.values(TEXT_CONDITION), { each: true })
  @IsString()
  @IsOptional()
  textCondition?: TEXT_CONDITION;

  @ApiProperty({
    example: 'Input something',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  text?: string;

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
