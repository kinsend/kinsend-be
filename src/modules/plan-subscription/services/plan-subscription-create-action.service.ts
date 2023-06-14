/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { Item } from '../../subscription/dtos/CreateSubscriptionByCustomerId.dto';
import { IPrice } from '../../subscription/interfaces/IGetPriceByItems';
import { PlanSubscriptionCreateDto } from '../dto/plan-subscription-create.dto';
import { PlanSubscription, PlanSubscriptionDocument } from '../plan-subscription.schema';

@Injectable()
export class PlanSubscriptionCreateAction {
  constructor(
    @InjectModel(PlanSubscription.name)
    private subscriptionPlanDocument: Model<PlanSubscriptionDocument>,

    private stripeService: StripeService,
  ) {}

  async execute(
    context: RequestContext,
    payload: PlanSubscriptionCreateDto,
  ): Promise<PlanSubscriptionDocument> {
    const priceProduct = await this.getPriceByItems(context, [
      { price: payload.priceId, planPaymentMethod: payload.planPaymentMethod },
    ]);
    const { price, priceId, productName } = priceProduct;
    const schedule = await new this.subscriptionPlanDocument({
      ...payload,
      price: price,
      productName,
    }).save();
    return schedule;
  }

  private async getPriceByItems(context: RequestContext, prices: Item[]): Promise<IPrice> {
    const pricesResponse = await Promise.all(
      prices.map((price) => {
        return this.stripeService.getDetailPrice(context, price.price);
      }),
    );
    if (prices.length === 0) {
      throw new NotFoundException(`price: ${prices} not found!`);
    }
    const product = await this.stripeService.getProductById(
      context,
      pricesResponse[0].product as string,
    );
    if (!product) {
      throw new NotFoundException('Product not found!');
    }
    return {
      priceId: pricesResponse[0].id,
      price: pricesResponse[0].unit_amount || 0,
      productName: product.name,
    };
  }
}
