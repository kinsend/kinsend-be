import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentAddCreditCardDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
