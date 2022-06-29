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
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { DURATION, TASK_TYPE, TRIGGER_TYPE } from '../interfaces/const';

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
    type: Date,
    description: 'Date',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  datetime?: Date;

  @ApiProperty({ example: 1, required: false, type: String })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({ example: 'Jan', required: false, type: String })
  @IsString()
  @IsOptional()
  month?: string;

  @ApiProperty({ example: 'Sunday', required: false, type: String })
  @IsString()
  @IsOptional()
  dayOfWeek?: string;

  @ApiProperty({ example: '9:00 AM', required: false, type: String })
  @IsString()
  @IsOptional()
  time?: string;

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

  @ApiProperty({ example: 'GMT+0700', required: false, type: String })
  @IsString()
  @IsOptional()
  timeZone?: string;
}

export class TaskPayload {
  @ApiProperty({
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: true,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TASK_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  type: TASK_TYPE;

  @ApiProperty({ example: 'Say something....', required: false, type: String, maxLength: 260 })
  @IsString()
  @MaxLength(260)
  @IsNotEmpty()
  @IsOptional()
  message?: string;

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
export class AutomationCreatePayload {
  @ApiProperty({
    example: 'Title',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: true,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({ example: [TaskPayload], type: [TaskPayload], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskPayload)
  tasks: TaskPayload[];
}
