import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserPasswordUpdatePayload {
  @ApiProperty({ example: 'newPasssword', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @ApiProperty({ example: 'oldPassword', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;
}
