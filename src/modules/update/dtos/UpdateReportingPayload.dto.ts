import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { FormSubmission } from '../../form.submission/form.submission.schema';

export class UpdateReportingPayload {
  @ApiProperty({
    example: 1,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  deliveredNumbers?: number;

  @ApiProperty({
    example: 1,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  bounced?: number;

  @ApiProperty({
    required: false,
    type: [FormSubmission],
  })
  @IsOptional()
  responded?: FormSubmission[];
}
