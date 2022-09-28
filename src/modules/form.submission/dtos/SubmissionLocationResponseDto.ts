import { ApiProperty } from '@nestjs/swagger';

export class SubmissionLocationResponseDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ example: 'US', required: true })
  location: string;
}
