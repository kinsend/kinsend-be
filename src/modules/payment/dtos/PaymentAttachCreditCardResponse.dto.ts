import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentAttachCreditCardDto {
  @IsNotEmpty()
  @IsString()
  customer: string;
}
