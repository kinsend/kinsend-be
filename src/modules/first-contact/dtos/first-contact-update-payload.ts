/* eslint-disable unicorn/prefer-set-has */
/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsIn,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { TaskPayload } from '../../automation/dtos/AutomationCreatePayload.dto';

export class Options {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  tag: string;
}
export class FirstContactUpdatePayload {
  @ApiProperty({ example: TaskPayload, type: TaskPayload, required: false })
  @Type(() => TaskPayload)
  firstTask?: TaskPayload;

  @ApiProperty({ example: TaskPayload, type: TaskPayload, required: false })
  @Type(() => TaskPayload)
  @IsOptional()
  reminderTask?: TaskPayload;

  @ApiProperty({ example: true, required: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isEnable?: boolean;
}
