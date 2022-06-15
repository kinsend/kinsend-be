/* eslint-disable unicorn/filename-case */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase } from 'class-validator';

export class CNAMECreatePayload {
  @ApiProperty({ example: 'cname-title', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  title: string;

  @ApiProperty({ example: 'domain.com', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  value: string;
}
