/* eslint-disable unicorn/prefer-set-has */
/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsIn, IsArray, IsOptional } from 'class-validator';
import { CUSTOM_FIELDS_TYPE } from '../interfaces/custom.fields.interface';

export class Options {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  tag: string;
}
export class CustomFieldsCreatePayload {
  @ApiProperty({ example: 'SINGLE_TEXT', required: true, enum: CUSTOM_FIELDS_TYPE, type: String })
  @IsString()
  @IsIn(Object.values(CUSTOM_FIELDS_TYPE))
  @IsNotEmpty()
  type: CUSTOM_FIELDS_TYPE;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  placeholder: string;

  @ApiProperty({ example: true, required: true, type: Boolean })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ example: [Options], required: false, type: [Options] })
  @IsArray()
  @IsOptional()
  options?: Options[];
}
