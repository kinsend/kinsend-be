import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthVerifyTokenPayloadDto {
  @ApiProperty({
    description: 'Enter a accessToken/refreshToken',
    type: String,
    required: true,
  })
  @IsString()
  token!: string;
}
