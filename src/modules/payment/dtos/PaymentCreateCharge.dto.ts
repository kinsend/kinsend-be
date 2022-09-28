import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentCreateChargeDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
