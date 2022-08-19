import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength, IsLowercase, IsEmail } from 'class-validator';

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
}
