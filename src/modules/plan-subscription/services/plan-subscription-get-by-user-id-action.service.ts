/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlanSubscription, PlanSubscriptionDocument } from '../plan-subscription.schema';

@Injectable()
export class PlanSubscriptionGetByUserIdAction {
  constructor(
    @InjectModel(PlanSubscription.name)
    private subscriptionPlanDocument: Model<PlanSubscriptionDocument>,
  ) {}

  async execute(userId: string): Promise<PlanSubscriptionDocument | null> {
    return this.subscriptionPlanDocument.findOne({
      userId,
    });
  }
}
