import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';

export class FormSubmissionUpdatePayload {
  @ApiProperty({ example: 'lorem@gmail.com', type: String, required: false })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Lo', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Rem', required: false, type: String })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'Location lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '{lorem fields}', required: false, type: String })
  @IsString()
  @IsOptional()
  metaData?: string;

  @ApiProperty({ example: ['234', '234'], required: false, type: String })
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isContactArchived?: boolean;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isContactHidden?: boolean;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isFacebookContact?: boolean;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;

  @ApiProperty({ example: PhoneNumber, required: true, type: PhoneNumber })
  @IsOptional()
  phoneNumber?: PhoneNumber;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isVip?: boolean;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isConversationArchived?: boolean;

  @ApiProperty({ example: true, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isConversationHidden?: boolean;
}
