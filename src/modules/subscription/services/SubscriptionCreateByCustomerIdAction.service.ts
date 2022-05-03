/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../../configs/config.service';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { CreateSubscriptionByCustomerIdDto } from '../dtos/CreateSubscriptionByCustomerId.dto';

@Injectable()
export class SubscriptionCreateByCustomerIdAction {
  constructor(
    private readonly stripeService: StripeService,

    private configService: ConfigService,
  ) {}

  async execute(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const subscriptions = await this.stripeService.createSubscriptionByCustomer(context, payload);
    return subscriptions;
  }
}
