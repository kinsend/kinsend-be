import {  Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { PlanSubscription, PlanSubscriptionSchema } from './plan-subscription.schema';
import { PlanSubscriptionCreateAction } from './services/plan-subscription-create-action.service';
import { PlanSubscriptionGetByUserIdAction } from './services/plan-subscription-get-by-user-id-action.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: PlanSubscription.name, schema: PlanSubscriptionSchema }]),
  ],
  providers: [PlanSubscriptionCreateAction, PlanSubscriptionGetByUserIdAction],
  exports: [PlanSubscriptionCreateAction, PlanSubscriptionGetByUserIdAction],
})
export class PlanSubscriptionModule {}
