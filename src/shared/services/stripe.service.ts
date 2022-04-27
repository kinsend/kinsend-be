import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../configs/config.service';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { RequestContext } from '../../utils/RequestContext';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: '2020-08-27',
    });
  }

  async createCustomerUser(
    context: RequestContext,
    name: string,
    email: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const { logger, correlationId } = context;
    try {
      const customerInfo = await this.stripe.customers.create({
        name,
        email,
      });
      return customerInfo;
    } catch (error: unknown) {
      const message = 'Request create customer is not successful';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new IllegalStateException(message);
    }
  }

  async chargePaymentUser(
    context: RequestContext,
    amount: number,
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const { logger, correlationId } = context;
    try {
      const paymentInfo = await this.stripe.paymentIntents.create({
        amount,
        customer: customerId,
        payment_method: paymentMethodId,
        currency: this.configService.stripeCurrency,
        confirm: true,
      });
      return paymentInfo;
    } catch (error: unknown) {
      const message = 'Request charge payment with card is not successful';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new IllegalStateException(message);
    }
  }

  async storedCreditCard(
    context: RequestContext,
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const { logger, correlationId } = context;
    try {
      const cardInfo = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
      });
      return cardInfo;
    } catch (error: unknown) {
      const message = 'Request stored card  is not successful';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new IllegalStateException(message);
    }
  }

  async listStoredCreditCards(
    context: RequestContext,
    customerId: string,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.PaymentMethod>>> {
    const { logger, correlationId } = context;
    try {
      const listCardInfo = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return listCardInfo;
    } catch (error: unknown) {
      const message = 'Request list stored cards is not successful';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new IllegalStateException(message);
    }
  }
}
