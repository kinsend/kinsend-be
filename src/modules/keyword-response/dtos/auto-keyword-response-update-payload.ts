/* eslint-disable unicorn/prefer-set-has */
/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsIn, IsNumber } from 'class-validator';
import { TaskPayload } from '../../automation/dtos/AutomationCreatePayload.dto';

export class AutoKeywordResponseUpdatePayload {
  @ApiProperty({ example: TaskPayload, type: TaskPayload, required: false })
  @Type(() => TaskPayload)
  response?: TaskPayload;

  @ApiProperty({ example: 'Hi', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  pattern?: string;

  @ApiProperty({ example: '6287cda8bd4f7f5776df1c4c', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tagId?: string;

  @ApiProperty({ example: 1, required: false, type: Number })
  @IsNumber()
  @IsOptional()
  index?: number;
}
