/* eslint-disable unicorn/filename-case */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlanSubscriptionCreateDto } from '../dto/plan-subscription-create.dto';
import { PlanSubscription, PlanSubscriptionDocument } from '../plan-subscription.schema';

@Injectable()
export class PlanSubscriptionCreateAction {
  constructor(
    @InjectModel(PlanSubscription.name)
    private subscriptionPlanDocument: Model<PlanSubscriptionDocument>,
  ) {}

  async execute(payload: PlanSubscriptionCreateDto): Promise<PlanSubscriptionDocument> {
    const schedule = await new this.subscriptionPlanDocument({ ...payload }).save();
    return schedule;
  }
}
