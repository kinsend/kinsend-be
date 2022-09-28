/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsMongoId, IsIn, IsArray, ValidateNested } from 'class-validator';
import { TRIGGER_TYPE } from '../interfaces/const';
import { TaskPayload } from './AutomationCreatePayload.dto';

export class AutomationUpdatePayload {
  @ApiProperty({
    example: 'Title',
    required: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: true,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsString()
  @IsOptional()
  triggerType?: TRIGGER_TYPE;

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
  @IsOptional()
  tasks?: TaskPayload[];
}
