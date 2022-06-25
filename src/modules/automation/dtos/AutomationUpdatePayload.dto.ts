/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsMongoId,
  IsIn,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { DURATION, TRIGGER_TYPE } from '../interfaces/const';

export class DateTimeFromTrigger {
  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  days?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  hours?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  minutes?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  seconds?: number;
}

export class Delay {
  @ApiProperty({
    example: DURATION.UNTIL_DATE,
    required: true,
    enum: DURATION,
    type: String,
  })
  @IsIn(Object.values(DURATION), { each: true })
  @IsString()
  @IsNotEmpty()
  duration: DURATION;

  @ApiProperty({
    example: '2022-06-24T08:45:41.711Z',
    required: true,
    type: DateTimeFromTrigger,
    description: 'Date or DateTimeFromTrigger',
  })
  @IsNotEmpty()
  datetime: Date | DateTimeFromTrigger;

  @ApiProperty({ example: 'GMT+0700', required: false, type: String })
  @IsString()
  @IsOptional()
  timeZone?: string;
}

export class TaskPayload {
  @ApiProperty({ example: 'Say something....', required: true, type: String, maxLength: 260 })
  @IsString()
  @MaxLength(260)
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'https://aws.com/s3/bucket/file.png', required: false, type: String })
  @IsOptional()
  @IsString()
  fileAttached?: string;

  @ApiProperty({ example: Delay, required: false, type: Delay })
  @IsOptional()
  @ValidateNested({
    message: 'must be object',
  })
  @Type(() => Delay)
  delay?: Delay;
}
export class AutomationUpdatePayload {
  @ApiProperty({
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: false,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  triggerType: TRIGGER_TYPE;

  @ApiProperty({
    example: ['12345678o'],
    type: [String],
    required: false,
    description: 'Required when triggerType is CONTACT_TAGGED',
  })
  @IsMongoId({ each: true })
  @IsOptional()
  @IsArray()
  taggedTagIds?: string[];

  @ApiProperty({ example: 'CONTACT_CREATED', type: String, required: false })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsOptional()
  stopTriggerType?: TRIGGER_TYPE;

  @ApiProperty({
    example: ['12345678o'],
    type: [String],
    required: false,
    description: 'Required when stopTriggerType is CONTACT_TAGGED',
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  stopTaggedTagIds?: string[];

  @ApiProperty({ example: [TaskPayload], type: [TaskPayload], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TaskPayload)
  tasks: TaskPayload[];
}
