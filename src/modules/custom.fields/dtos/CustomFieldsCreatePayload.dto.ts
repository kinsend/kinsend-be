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

export class CustomFieldsCreatePayload {
  @ApiProperty({ example: 'SINGLE_TEXT', required: true, enum: CUSTOM_FIELDS_TYPE, type: String })
  @IsString()
  @IsIn(Object.values(CUSTOM_FIELDS_TYPE))
  @IsNotEmpty()
  type: CUSTOM_FIELDS_TYPE;

  @ApiProperty({ example: 'Tag', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  tag: string;

  @ApiProperty({ example: 'What is today?', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'Lorem', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  placeholder: string;

  @ApiProperty({ example: true, required: true, type: Boolean })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ example: [Options], required: false, type: [Options] })
  @IsArray()
  @IsOptional()
  options?: Options[];
}
