import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsLowercase,
  IsEmail,
  IsMongoId,
  IsObject,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';

export class ContactImport {
  @ApiProperty({ example: 'lorem@gmail.com', type: String, required: false })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: PhoneNumber, required: true, type: PhoneNumber })
  @IsObject()
  phoneNumber: PhoneNumber;

  @ApiProperty({ example: 'Location lorem', required: false, type: String })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: '{lorem fields}', required: false, type: String })
  @IsString()
  @IsOptional()
  metaData?: string;
}

export class ContactImportPayload {
  @ApiProperty({ required: true, type: [ContactImport] })
  @IsArray()
  contacts: ContactImport[];

  @ApiProperty({ example: 2, required: true, type: Number })
  @IsNumber()
  row: number;

  @ApiProperty({ example: 2, required: true, type: Number })
  @IsNumber()
  numbersContactImported: number;

  @ApiProperty({ example: 2, required: true, type: Number })
  @IsNumber()
  numbersColumnMapped: number;

  @ApiProperty({ example: '{tagId}', required: false, type: String })
  @IsString()
  @IsOptional()
  tagId?: string;

  @ApiProperty({ example: false, required: false, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean;
}
