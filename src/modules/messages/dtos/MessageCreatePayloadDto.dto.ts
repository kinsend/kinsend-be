/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MessageCreatePayloadDto {
  @ApiProperty({
    example: 'Message',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: '/image.jpg',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  fileAttached?: string;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  dateSent: Date;

  @ApiProperty({
    example: 1,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  errorCode?: number;

  @ApiProperty({
    example: 'Error',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    example: 'Success',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: '+15558675310',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumberSent: string;

  @ApiProperty({
    example: '+15558675310',
    required: false,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumberReceipted: string;

  @ApiProperty({
    example: false,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isSubscriberMessage = false;
}
