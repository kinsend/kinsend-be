import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerificationConfirmEmailQueryDto {
  @ApiProperty({ example: 'JWT Token' })
  @IsString()
  @MinLength(6)
  token: string;
}
