import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class VerificationRequestPhoneNumberDto {
  @ApiProperty({ example: '+123789654' })
  phoneNumber: string;

  @ApiProperty({ example: '333-444' })
  verifyCode?: string;
}
