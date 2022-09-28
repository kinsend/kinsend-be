import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentConfirmCreditCardDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
