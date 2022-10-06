import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TYPE_PAYMENT } from '../../../domain/const';

export class PaymentMonthlyCreateDto {
  @ApiProperty({ example: 'abc', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'abc', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  chargeId: string;

  @ApiProperty({ example: 'abc', type: String, required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  updateId?: string;

  @ApiProperty({ example: 'abc', type: String, required: true })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ example: true, type: Boolean, required: true })
  @IsBoolean()
  @IsNotEmpty()
  statusPaid: boolean;

  @ApiProperty({ example: 1, type: Number, required: true })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ example: 1, type: Number, required: true })
  @IsNotEmpty()
  @IsNumber()
  totalMessages: number;

  @ApiProperty({ example: 1, type: Number, required: false })
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  totalSubs?: number;

  @ApiProperty({
    example: TYPE_PAYMENT.MESSAGE,
    enum: TYPE_PAYMENT,
    required: true,
    type: String,
  })
  @IsIn(Object.values(TYPE_PAYMENT))
  @IsString()
  @IsNotEmpty()
  typePayment: TYPE_PAYMENT;

  @ApiProperty({
    example: 'July 20, 2022 10:36 pm',
    required: true,
    type: Date,
    description: 'Datetime',
  })
  @IsString()
  datePaid: Date;
}
