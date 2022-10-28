import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserResetPassword {
  @ApiProperty({ example: 'abc@gmail.com', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  email!: string;
}

export class UserVerifyResetPassword {
  @ApiProperty({ example: '123456', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  newPassword!: string;
}
