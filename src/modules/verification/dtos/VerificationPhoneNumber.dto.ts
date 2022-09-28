import { ApiProperty } from '@nestjs/swagger';

export class VerificationPhoneNumberDto {
  @ApiProperty({ example: '+123789654' })
  phoneNumber: string;

  @ApiProperty({ example: '333-444' })
  verifyCode?: string;
}
