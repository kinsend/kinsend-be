/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PAYMENT_PROGRESS } from '../../../domain/const';
import { PLAN_PAYMENT_METHOD } from '../../plan-subscription/plan-subscription.constant';

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
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    example: '123',
    required: true,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  pricePlan: number;

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
    required: false,
    enum: PLAN_PAYMENT_METHOD,
    type: String,
  })
  @IsIn(Object.values(PLAN_PAYMENT_METHOD))
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: PLAN_PAYMENT_METHOD;

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
