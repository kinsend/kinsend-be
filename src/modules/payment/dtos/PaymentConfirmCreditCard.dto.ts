import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PaymentConfirmCreditCardDto {
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
