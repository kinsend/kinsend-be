import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsString } from 'class-validator';

export class AuthSignInPayloadDto {
  @ApiProperty({ example: 'lorem', type: String })
  @MaxLength(100)
  username: string;

  @ApiProperty({
    example: '6932ff7555e0e88f3c0d13498b05955485894b316dba9676b15891b59ca0cdea',
  })
  @IsString()
  password: string;
}
