import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class UserCreatePayloadDto {
  @ApiProperty({ example: 'lorem@gmail.com', type: String })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456@abc' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @Length(1, 50)
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @Length(1, 50)
  lastName: string;

  @ApiProperty({ example: 'https://facebook.com/user', required: false, type: String })
  @IsString()
  @Length(3, 50)
  @IsOptional()
  oneSocial?: string;

  @ApiProperty({ example: 123456, required: false, type: Number })
  @IsString()
  @Length(3, 20)
  @IsOptional()
  phoneNumber?: number;
}
