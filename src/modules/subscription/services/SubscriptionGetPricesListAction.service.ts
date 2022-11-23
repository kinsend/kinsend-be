/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class SubscriptionGetPricesListAction {
  constructor(
    private readonly stripeService: StripeService,

    private configService: ConfigService,
  ) {}

  async execute(context: RequestContext): Promise<Stripe.Response<Stripe.ApiList<Stripe.Price>>> {
    const prices = await this.stripeService.getPricesList(context);
    const pricesResult = prices.data.filter((price) =>
      this.configService.planAvailable.includes((price.product as any).name),
    );
    return {
      ...prices,
      data: pricesResult,
    };
  }
}
