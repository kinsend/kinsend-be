import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SmsSentPayload {
  @ApiProperty({
    example: '62c6ba6d3cc53d8d8201fb15',
    required: true,
    type: String,
  })
  @IsMongoId()
  @IsNotEmpty()
  formSubmissionId: string;

  @ApiProperty({
    example: 'Hello <fname>, Welcome!',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  message: string;

  @ApiProperty({
    example: 'https://service.com/image',
    required: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}
