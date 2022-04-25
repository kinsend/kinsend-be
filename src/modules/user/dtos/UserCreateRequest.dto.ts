import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PhoneNumber } from './UserCreateResponse.dto';

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

  @ApiProperty({ example: 123456, required: true, type: PhoneNumber })
  @IsObject()
  @IsOptional()
  phoneNumber?: PhoneNumber;
}
