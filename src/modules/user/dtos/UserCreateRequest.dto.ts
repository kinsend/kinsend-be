import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'https://facebook.com/user', required: false, type: String })
  @IsString()
  @IsOptional()
  oneSocial?: string;

  @ApiProperty({ example: 123456, required: false, type: Number })
  @IsNumber()
  @IsOptional()
  phoneNumber?: number;
}
