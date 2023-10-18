/* eslint-disable max-classes-per-file */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PLAN_PAYMENT_METHOD, PLAN_SUBSCRIPTION_STATUS } from '../plan-subscription.constant';

export class PlanSubscriptionCreateDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  status: PLAN_SUBSCRIPTION_STATUS;

  @IsString()
  @IsNotEmpty()
  planPaymentMethod: PLAN_PAYMENT_METHOD;

  @IsString()
  @IsOptional()
  registrationDate?: Date;
}
