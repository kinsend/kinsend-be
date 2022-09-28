/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Filter } from '../../segment/dtos/SegmentCreatePayload.dto';
import { INTERVAL_TRIGGER_TYPE, UPDATE_PROGRESS } from '../interfaces/const';

export class UpdateModelUpdatePayload {
  @ApiProperty({
    example: 'Hi, this is a message',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  message?: string;

  @ApiProperty({
    required: true,
    type: Filter,
  })
  @IsOptional()
  @ValidateNested({
    message: 'must be object',
  })
  @Type(() => Filter)
  filter?: Filter;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  @IsOptional()
  datetime?: Date;

  @ApiProperty({
    example: INTERVAL_TRIGGER_TYPE.EVERY_DAY,
    required: true,
    enum: INTERVAL_TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(INTERVAL_TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  triggerType?: INTERVAL_TRIGGER_TYPE;

  @ApiProperty({
    example: UPDATE_PROGRESS.DONE,
    required: true,
    enum: UPDATE_PROGRESS,
    type: String,
  })
  @IsIn(Object.values(UPDATE_PROGRESS), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  progress?: UPDATE_PROGRESS;
}
