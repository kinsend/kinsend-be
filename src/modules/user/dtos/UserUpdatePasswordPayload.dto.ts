import { IsNotEmpty, IsString } from 'class-validator';

export class UserPasswordUpdatePayload {
  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  oldPassword!: string;
}
