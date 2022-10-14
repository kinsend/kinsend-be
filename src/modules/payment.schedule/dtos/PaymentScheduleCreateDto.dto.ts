/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PAYMENT_PROGRESS } from '../../../domain/const';

export class PaymentScheduleCreateDto {
  @ApiProperty({
    example: '123',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '123',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  scheduleName: string;

  @ApiProperty({
    example: '123',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  customerId: string;

  @ApiProperty({
    example: PAYMENT_PROGRESS.SCHEDULED,
    required: true,
    enum: PAYMENT_PROGRESS,
    type: String,
  })
  @IsIn(Object.values(PAYMENT_PROGRESS), { each: true })
  @IsString()
  @IsNotEmpty()
  progress: PAYMENT_PROGRESS;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  datetime: Date;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  createdAt: Date;
}
