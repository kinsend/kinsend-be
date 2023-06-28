/* eslint-disable no-plusplus */
/* eslint-disable unicorn/prevent-abbreviations */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import * as Chargebee from 'chargebee';
import { ChargeBee, _item } from 'chargebee-typescript';
import { RequestContext } from 'src/utils/RequestContext';
import { ConfigService } from '../../configs/config.service';

@Injectable()
export class ChargebeeService {
  private chargebee = new ChargeBee();

  constructor(private readonly configService: ConfigService) {
    this.chargebee.configure({
      site: this.configService.chargebeeSite,
      api_key: this.configService.chargebeeApiKey,
    });
  }

  async chargePaymentUser(
    context: RequestContext,
    amount: number,
    customerId: string,
    description?: string,
  ): Promise<any> {
    try {
      const payload = {
        customer: {
          id: customerId,
        },
        amount,
        // currency: 'USD', // Replace with your desired currency code
        description,
        currency_code: 'USD',
      };

      const paymentIntent = await this.chargebee.payment_intent.create(payload);
      return paymentIntent;
    } catch (error: any) {
      const message = 'Exception charging payment method error by Chargebee';
      throw new InternalServerErrorException({
        message,
        error: error.message || error,
      });
    }
  }

  async getDetailPrice(context: RequestContext, priceId: string): Promise<any> {
    const { logger, correlationId } = context;
    try {
      // const price = await this.chargebee.item('STARTER');
      const price: any = await new Promise((resolve, reject) => {
        this.chargebee.item.retrieve(priceId).request(function (error, result) {
          if (error) {
            const message = 'Exception get price error by Stripe';
            logger.error({
              correlationId,
              message,
              error,
            });
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
      return price?.item;
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

  async getPricesList(context: RequestContext, limit = 10): Promise<any> {
    const { logger, correlationId } = context;
    try {
      // const result = await this.chargebee.item
      //   .list({ limit })
      //   .request(function (error: any, res: any) {
      //     if (error) {
      //       console.log('error', error);
      //     } else {
      //       console.log(res);
      //       return res;
      //     }
      //   });

      const result: any = await new Promise((resolve, reject) => {
        this.chargebee.item.list({ limit }).request(function (error: any, res: any) {
          if (error) {
            const message = 'Exception retrieving plans by Chargebee';
            logger.error({
              correlationId,
              message,
              error: error.message || error,
            });
            reject(error);
          } else {
            resolve(res);
          }
        });
      });

      const temp: any = [];
      for (let i = 0; i < result.list.length; i++) {
        const entry = result.list[i].item;
        temp.push(entry);
      }
      return temp;
    } catch (error: any) {
      const message = 'Exception retrieving plans by Chargebee';
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

  async createCustomerUser(
    context: RequestContext,
    first_name: string,
    last_name: string,
    email: string,
  ): Promise<any> {
    const { logger, correlationId } = context;
    try {
      // const customerInfo = await this.stripe.customers.create({
      //   name,
      //   email,
      // });
      const customerInfo: any = await new Promise((resolve, reject) => {
        this.chargebee.customer
          .create({
            first_name,
            last_name,
            email,
          })
          .request(function (error: any, result: any) {
            if (error) {
              const message = 'Exception created customer method error by Stripe';
              logger.error({
                correlationId,
                message,
                error,
              });
              reject(error);
            } else {
              resolve(result.customer);
            }
          });
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

  async storedCreditCard(
    context: RequestContext,
    paymentMethodId: string,
    customerId: string,
    paymentMethodTypes: string,
  ): Promise<any> {
    const { logger, correlationId } = context;
    try {
      // const cardInfo = await this.stripe.setupIntents.create({
      //   customer: customerId,
      //   payment_method: paymentMethodId,
      //   payment_method_types: paymentMethodTypes,
      // });

      const cardInfo: any = await new Promise((resolve, reject) => {
        this.chargebee.payment_source
          .create_using_temp_token({
            customer_id: customerId,
            type: paymentMethodTypes,
            tmp_token: paymentMethodId,
            // gateway_account_id: 'gw_16BYd1Thok5TT10d',
          })
          .request(function (error: any, result: any) {
            if (error) {
              console.log('error =================== ', error)
              const message = 'Exception stored payment method error by Chargebee';
              logger.error({
                correlationId,
                message,
                error,
              });
              reject(error);
            } else {
              resolve(result.payment_source);
            }
          });
      });
      console.log('cardInfo', cardInfo);
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
}
