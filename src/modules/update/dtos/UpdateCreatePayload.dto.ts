/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Filter } from '../../segment/dtos/SegmentCreatePayload.dto';
import { UPDATE_TRIGGER_TYPE } from '../interfaces/const';

export class UpdateCreatePayload {
  @ApiProperty({
    example: 'Hi, this is a message',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    required: true,
    type: Filter,
  })
  @ValidateNested({
    message: 'must be object',
  })
  @Type(() => Filter)
  filter: Filter;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  datetime: Date;

  @ApiProperty({
    example: UPDATE_TRIGGER_TYPE.EVERY_DAY,
    required: true,
    enum: UPDATE_TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(UPDATE_TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  triggerType: UPDATE_TRIGGER_TYPE;
}
