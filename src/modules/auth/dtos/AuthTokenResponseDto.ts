import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dtos/UserResponse.dto';

export class AuthAccessTokenResponseDto extends UserResponseDto {
  @ApiProperty({ example: '123456789', type: String, required: true })
  sessionId!: string | null;

  @ApiProperty({ example: 123456789, type: Number, required: true })
  iat?: number;

  @ApiProperty({ example: 123456789, type: Number, required: true })
  exp?: number;

  @ApiProperty({ example: false, type: Boolean, required: false })
  isEnabledBuyPlan?: boolean;

  @ApiProperty({ example: false, type: Boolean, required: false })
  isEnabledPayment?: boolean;

  @ApiProperty({ example: 'https://domain.image.com/image', type: String, required: false })
  image?: string;
}
