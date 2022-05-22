/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsIn, IsArray, IsOptional } from 'class-validator';
import { CUSTOM_FIELDS_TYPE } from '../interfaces/custom.fields.interface';

export class Options {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}

export class CustomFieldsUpdatePayload {
  @ApiProperty({ example: 'SINGLE_TEXT', required: false, enum: CUSTOM_FIELDS_TYPE, type: String })
  @IsString()
  @IsIn(Object.values(CUSTOM_FIELDS_TYPE))
  @IsOptional()
  type?: CUSTOM_FIELDS_TYPE;

  @ApiProperty({ example: 'Tag', required: false, type: String })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ example: 'What is today?', required: false, type: String })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiProperty({ example: true, required: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ example: [Options], required: false, type: [Options] })
  @IsArray()
  @IsOptional()
  options?: Options[];
}
