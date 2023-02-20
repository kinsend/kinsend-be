/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';
import { PLAN_PAYMENT_METHOD } from '../../plan-subscription/plan-subscription.constant';

export class Item {
  price: string;

  @ApiProperty({ example: PLAN_PAYMENT_METHOD.ANNUAL, required: true, type: String })
  planPaymentMethod: PLAN_PAYMENT_METHOD;
}

export class CreateSubscriptionByCustomerIdDto {
  @ApiProperty({ example: 'cus_123456', required: true, type: String })
  @IsNotEmpty()
  customer: string;

  @ApiProperty({ example: [Item], required: true, type: [Item] })
  @IsArray()
  items: Item[];
}
