/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { Options } from './CustomFieldsCreatePayload.dto';

export class CustomFieldsUpdatePayload {
  @ApiProperty({ example: 'What is today?', required: false, type: String })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ example: [Options], required: false, type: [Options] })
  @IsArray()
  @IsOptional()
  options?: Options[];
}
