/* eslint-disable max-classes-per-file */
import { IsNotEmpty } from 'class-validator';

export class PaymentMethod {
  id: string;

  object: string;

  billing_details: BillingDetails;

  card: Card;

  created: number;

  customer: null;

  livemode: boolean;

  type: string;
}

export class BillingDetails {
  address: Address;

  email: null;

  name: null;

  phone: null;
}

export class Address {
  city: null;

  country: null;

  line1: null;

  line2: null;

  postal_code: null;

  state: null;
}

export class Card {
  brand: string;

  checks: Checks;

  country: string;

  exp_month: number;

  exp_year: number;

  funding: string;

  generated_from: null;

  last4: string;

  networks: Networks;

  three_d_secure_usage: ThreeDSecureUsage;

  wallet: null;
}

export class Checks {
  address_line1_check: null;

  address_postal_code_check: null;

  cvc_check: null;
}

export class Networks {
  available: string[];

  preferred: null;
}

export class ThreeDSecureUsage {
  supported: boolean;
}

export class PaymentStoredCreditCardDto {
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
