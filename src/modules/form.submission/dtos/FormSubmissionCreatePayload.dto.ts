import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsLowercase,
  IsEmail,
  IsMongoId,
} from 'class-validator';

export class FormSubmissionCreatePayload {
  @ApiProperty({ example: '12345678o', type: String, required: true })
  @IsMongoId()
  formId: string;

  @ApiProperty({ example: 'lorem@gmail.com', type: String, required: true })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '0123456789', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Location lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '{lorem fields}', required: false, type: String })
  @IsString()
  @IsOptional()
  metaData?: string;
}
