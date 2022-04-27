import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../configs/config.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: '2020-08-27',
    });
  }

  async createCustomerUser(name: string, email: string) {
    return this.stripe.customers.create({
      name,
      email,
    });
  }

  async chargePaymentUser(amount: number, paymentMethodId: string, customerId: string) {
    return this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method: paymentMethodId,
      currency: this.configService.stripeCurrency,
      confirm: true,
    });
  }
}
