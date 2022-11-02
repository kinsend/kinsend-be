import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsLowercase, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class VirtualCardCreatePayloadDto {
  @ApiProperty({ example: 'lorem@gmail.com', type: String, required: false })
  @IsLowercase()
  @MaxLength(50)
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '{{image_url}}', type: String, required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'Lo', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({ example: 'Rem', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({ example: 'title', required: false, type: String })
  @IsString()
  title?: string;

  @ApiProperty({ example: 'organization', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  organization?: string;

  @ApiProperty({ example: 'facebook.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiProperty({ example: 'instagram.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiProperty({ example: 'twitter.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiProperty({ example: 'linkedin.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  linkedIn?: string;

  @ApiProperty({ example: 'youtube.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  youtube?: string;

  @ApiProperty({ example: 'snapchat.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  snapchat?: string;

  @ApiProperty({ example: 'soundcloud.com/name', required: false, type: String })
  @IsString()
  @IsOptional()
  soundCloud?: string;

  @ApiProperty({ example: 'store.com', required: false, type: String })
  @IsString()
  @IsOptional()
  store?: string;

  @ApiProperty({ example: 'www.personal.com', required: false, type: String })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: '0123456789', required: false, type: String })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: 'I love something', required: false, type: String })
  @IsString()
  @IsOptional()
  note?: string;
}
