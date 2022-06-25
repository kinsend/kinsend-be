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
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { DURATION, TRIGGER_TYPE } from '../interfaces/const';

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

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  datetime: Date;

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
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: true,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  triggerType: TRIGGER_TYPE;

  @ApiProperty({ example: '12345678o', type: String, required: false })
  @IsMongoId()
  @IsOptional()
  userTaggedId?: string;

  @ApiProperty({ example: 'CONTACT_CREATED', type: String, required: false })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsOptional()
  stopTriggerType?: TRIGGER_TYPE;

  @ApiProperty({ example: [TaskPayload], type: [TaskPayload], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskPayload)
  tasks: TaskPayload[];
}
