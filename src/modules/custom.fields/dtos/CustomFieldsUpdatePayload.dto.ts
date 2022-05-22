/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class Options {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}

export class CustomFieldsUpdatePayload {
  @ApiProperty({ example: 'Tag', required: false })
  @IsArray()
  @IsOptional()
  tag?: string[];

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
