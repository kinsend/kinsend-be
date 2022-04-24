import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthRefreshTokenPayloadDto {
  @ApiProperty({
    example: 'Enter a refresh token',
    type: String,
    required: true,
  })
  @IsString()
  refreshToken!: string;
}
