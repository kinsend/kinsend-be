/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { UserFindByStripeCustomerUserIdAction } from 'src/modules/user/services/UserFindByStripeCustomerUserIdAction.service';
import Stripe from 'stripe';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { CreateSubscriptionByCustomerIdDto } from '../dtos/CreateSubscriptionByCustomerId.dto';

@Injectable()
export class SubscriptionCreateByCustomerIdAction {
  constructor(
    private readonly stripeService: StripeService,

    private readonly userFindByStripeCustomerUserIdAction: UserFindByStripeCustomerUserIdAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: CreateSubscriptionByCustomerIdDto,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const subscriptions = await this.stripeService.createSubscriptionByCustomer(context, payload);
    const userUpdate = await this.userFindByStripeCustomerUserIdAction.execute(payload.customer);
    await userUpdate.update({ isEnabledBuyPlan: true });
    return subscriptions;
  }
}
