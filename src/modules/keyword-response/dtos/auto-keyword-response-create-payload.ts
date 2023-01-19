/* eslint-disable unicorn/prefer-set-has */
/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { TaskPayload } from '../../automation/dtos/AutomationCreatePayload.dto';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';

export class AutoKeywordResponseCreatePayload {
  @ApiProperty({ example: TaskPayload, type: TaskPayload, required: false })
  @Type(() => TaskPayload)
  response?: TaskPayload;

  @ApiProperty({ example: 'Hi', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @ApiProperty({ example: '6287cda8bd4f7f5776df1c4c', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tagId?: string;

  @IsIn(Object.values(AUTO_KEYWORD_RESPONSE_TYPE))
  @IsString()
  @IsNotEmpty()
  type: AUTO_KEYWORD_RESPONSE_TYPE;
}
