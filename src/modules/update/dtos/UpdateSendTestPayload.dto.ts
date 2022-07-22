import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';

export class UpdateSendTestPayload {
  @ApiProperty({
    example: 'Hi, this is a message',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '62c65a04759a21de1ba360a0',
    required: true,
    type: String,
    description: 'This is form submission Id',
  })
  @IsMongoId()
  contactsId: string;

  @ApiProperty({
    example: 'First name',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fname?: string;

  @ApiProperty({
    example: 'Last name',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lname?: string;

  @ApiProperty({
    example: 'Full name',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: PhoneNumber, required: false, type: PhoneNumber })
  @IsOptional()
  phoneNumber?: PhoneNumber;
}
