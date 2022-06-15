/* eslint-disable unicorn/filename-case */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase, IsOptional } from 'class-validator';

export class CNAMEUpdatePayload {
  @ApiProperty({ example: 'cname-title', type: String, required: false })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'domain.com', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string;
}
