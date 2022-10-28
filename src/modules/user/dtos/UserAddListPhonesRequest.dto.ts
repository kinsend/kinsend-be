/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class PhoneNumber {
  @ApiProperty({ example: 123456, required: true, type: String })
  @IsString()
  phone: string;

  @ApiProperty({ example: 123, required: true, type: Number })
  @IsNumber()
  @Type(() => Number)
  code: number;

  @ApiProperty({ example: 'US', required: true, type: String })
  @IsString()
  short: string;
}
export class UserAddListPhonesRequest {
  @ApiProperty({ example: [PhoneNumber], required: true, type: [PhoneNumber] })
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => PhoneNumber)
  phoneNumbers: PhoneNumber[];
}
