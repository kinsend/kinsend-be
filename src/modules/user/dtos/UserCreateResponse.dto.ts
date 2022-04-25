import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserCreateResponseDto {
  @ApiProperty({ example: '123-456-789', type: String })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  id: string;

  @ApiProperty({ example: 'lorem@gmail.com', type: String })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @Length(3, 50)
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @Length(3, 50)
  lastName: string;

  @ApiProperty({
    example: 'https://facebook.com/user',
    required: true,
    type: String,
  })
  @IsString()
  @Length(3, 50)
  @IsOptional()
  oneSocial?: string;

  @ApiProperty({ example: 123456, required: true, type: Number })
  @IsString()
  @Length(3, 20)
  @IsOptional()
  phoneNumber?: number;
}
