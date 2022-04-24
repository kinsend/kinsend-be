import { ApiProperty } from '@nestjs/swagger';
import { UserCreateResponseDto } from '../../user/UserCreate/UserCreateResponse.dto';

export class AuthAccessTokenResponseDto extends UserCreateResponseDto {
  @ApiProperty({ example: '123456789', type: String, required: true })
  sessionId!: string | null;

  @ApiProperty({ example: 123456789, type: Number, required: true })
  iat?: number;

  @ApiProperty({ example: 123456789, type: Number, required: true })
  exp?: number;
}
