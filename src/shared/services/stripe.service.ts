/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../configs/config.service';
import { CreateSubscriptionByCustomerIdDto } from '../../modules/subscription/dtos/CreateSubscriptionByCustomerId.dto';
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
    } catch (error: any) {
      const message = 'Exception created customer method error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async chargePaymentUser(
    context: RequestContext,
    amount: number,
    paymentMethodId: string,
    customerId: string,
    description?: string,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const { logger, correlationId } = context;
    try {
      const payload = {
        amount: Math.ceil(amount),
        customer: customerId,
        payment_method: paymentMethodId,
        currency: this.configService.stripeCurrency,
        statement_descriptor: this.configService.stripeStatementDescriptor,
        confirm: true,
        description,
      };
      logger.info({
        message: 'Payload charging',
        payload,
      });
      const paymentInfo = await this.stripe.paymentIntents.create(payload);
      logger.info({
        correlationId,
        message: 'Charged successful',
        result: paymentInfo,
      });
      return paymentInfo;
    } catch (error: any) {
      const message = 'Exception charged payment method error by Stripe';
      logger.error({
        correlationId,
        message,
        error: error.message || error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async confirmPaymentIntentUser(
    context: RequestContext,
    paymentIntentId: string,
    payload: { paymentMethod: string },
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const { logger, correlationId } = context;
    try {
      const payment = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: payload.paymentMethod,
      });
      return payment;
    } catch (error: any) {
      const message = 'Exception charged payment method error by Stripe';
      logger.error({
        correlationId,
        message,
        error: error.message || error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async storedCreditCard(
    context: RequestContext,
    paymentMethodId: string,
    customerId: string,
    paymentMethodTypes: [string],
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const { logger, correlationId } = context;
    try {
      const cardInfo = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        payment_method_types: paymentMethodTypes,
      });
      return cardInfo;
    } catch (error: any) {
      const message = 'Exception stored payment method error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async attachPaymentMethodByCurrentCreditCard(
    context: RequestContext,
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.Response<Stripe.PaymentMethod>> {
    const { logger, correlationId } = context;
    try {
      const paymentInfo = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return paymentInfo;
    } catch (error: any) {
      const message = 'Exception attached payment method error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
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
    } catch (error: any) {
      console.log('error :>> ', error);
      const message = 'Exception list stored cards error by Stripe';
      logger.error({
        correlationId,
        message,
        error: error.message || error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async confirmCreditCard(
    context: RequestContext,
    setupIntentId: string,
    paymentMethod = 'pm_card_visa',
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const { logger, correlationId } = context;
    try {
      const cardInfo = await this.stripe.setupIntents.confirm(setupIntentId, {
        payment_method: paymentMethod,
      });
      return cardInfo;
    } catch (error: any) {
      const message = 'Exception confirmed card error by Stripe';
      logger.error({
        correlationId,
        message,
        error: error.message || error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async cancelCreditCard(
    context: RequestContext,
    setupIntentId: string,
  ): Promise<Stripe.Response<Stripe.SetupIntent>> {
    const { logger, correlationId } = context;
    try {
      return await this.stripe.setupIntents.cancel(setupIntentId);
    } catch (error: any) {
      const message = 'Exception cancel card error by Stripe';
      logger.error({
        correlationId,
        message,
        error: error.message || error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async getSubscriptionsList(
    context: RequestContext,
    limit = 10,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>> {
    const { logger, correlationId } = context;
    try {
      const data = await this.stripe.subscriptions.list({
        limit,
      });
      return data;
    } catch (error: any) {
      const message = 'Exception get subscriptions error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async getProductsList(
    context: RequestContext,
    limit = 10,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.Product>>> {
    const { logger, correlationId } = context;
    try {
      const data = await this.stripe.products.list({
        limit,
      });
      return data;
    } catch (error: any) {
      const message = 'Exception get products error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async getProductById(
    context: RequestContext,
    id: string,
  ): Promise<Stripe.Response<Stripe.Product>> {
    const { logger, correlationId } = context;
    try {
      const data = await this.stripe.products.retrieve(id);
      return data;
    } catch (error: any) {
      const message = 'Product not found!';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async getPricesList(
    context: RequestContext,
    limit = 10,
  ): Promise<Stripe.Response<Stripe.ApiList<Stripe.Price>>> {
    const { logger, correlationId } = context;
    try {
      const data = await this.stripe.prices.list({
        limit,
        expand: ['data.product'],
      });
      return data;
    } catch (error: any) {
      const message = 'Exception get prices error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async createSubscriptionByCustomer(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const { logger, correlationId } = context;
    try {
      const data = await this.stripe.subscriptions.create(payload);
      return data;
    } catch (error: any) {
      const message = 'Exception created subscription for customer error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async updateDefaultPaymentMethodByCustomerId(
    context: RequestContext,
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.Response<Stripe.Customer>> {
    const { logger, correlationId } = context;
    try {
      const customerInfo = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return customerInfo;
    } catch (error: any) {
      const message = 'Exception updated default payment method for customer error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }

  async payChargesCustomerStripe(
    context: RequestContext,
    payload: any,
  ): Promise<Stripe.Response<Stripe.Charge>> {
    const { logger, correlationId } = context;
    try {
      const charges = await this.stripe.charges.create(payload);
      return charges;
    } catch (error) {
      const message = 'Exception payment charges error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        message,
        error: error.message || error,
      });
    }
  }

  async getDetailPrice(
    context: RequestContext,
    priceId: string,
  ): Promise<Stripe.Response<Stripe.Price>> {
    const { logger, correlationId } = context;
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      return price;
    } catch (error: any) {
      const message = 'Exception get price error by Stripe';
      logger.error({
        correlationId,
        message,
        error,
      });
      throw new InternalServerErrorException({
        correlationId,
        message,
        error: error.message || error,
      });
    }
  }
}
