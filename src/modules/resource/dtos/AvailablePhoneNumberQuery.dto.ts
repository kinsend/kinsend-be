import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AvailablePhoneNumberQueryDto {
  @ApiProperty({ example: 'US' })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({ example: '10' })
  @IsOptional()
  limit: number;

  @IsOptional()
  useMock?: boolean;
}
