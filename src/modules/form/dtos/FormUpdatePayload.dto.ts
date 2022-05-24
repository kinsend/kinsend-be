import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsArray } from 'class-validator';
import { BOOLEAN_ARR, OPTIONAL_FIELDS } from '../interfaces/form.interface';

export class FormUpdatePayload {
  @ApiProperty({ example: '123456789', required: false, type: String })
  @IsString()
  @IsOptional()
  tagId?: string;

  @ApiProperty({ example: '123456789', required: false, type: String })
  @IsString()
  @IsOptional()
  customFieldsId?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  browserTitle?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  redirectUrl?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: OPTIONAL_FIELDS.BIRTHDAY,
    required: false,
    enum: OPTIONAL_FIELDS,
    type: String,
  })
  @IsOptional()
  @IsIn(Object.values(OPTIONAL_FIELDS), { each: true })
  @IsString({ each: true })
  @IsArray()
  optionalFields?: [OPTIONAL_FIELDS];

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  submisstion?: string;

  @ApiProperty({ example: 'false', required: false, type: String })
  @IsString()
  @IsOptional()
  @IsIn(BOOLEAN_ARR)
  isEnabled?: string;

  @ApiProperty({ example: 'true', required: false, type: String })
  @IsString()
  @IsOptional()
  @IsIn(BOOLEAN_ARR)
  isVcardSend?: string;

  @ApiProperty({ example: 'Lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  message?: string;
}
