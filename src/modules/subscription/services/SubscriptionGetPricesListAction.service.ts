/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ChargebeeService } from 'src/shared/services/chargebee.service';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class SubscriptionGetPricesListAction {
  constructor(
    private readonly stripeService: StripeService,
    private readonly chargebeeService: ChargebeeService,

    private configService: ConfigService,
  ) {}

  async execute(context: RequestContext): Promise<any> {
    const prices = await this.chargebeeService.getPricesList(context);
    const pricesResult = prices.filter((price: any) =>
      this.configService.planAvailable.includes(price.name),
    );
    return {
      data: pricesResult,
    };
  }
}
