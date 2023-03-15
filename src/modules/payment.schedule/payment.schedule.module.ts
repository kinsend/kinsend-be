import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { PlanSubscriptionModule } from '../plan-subscription/plan-subscription.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';
import { PaymentSchedule, PaymentScheduleSchema } from './payment.schedule.schema';
import { PaymentScheduleCreateAction } from './services/PaymentScheduleCreateAction.service';
import { PaymentScheduleFindAction } from './services/PaymentScheduleFindAction.service';
import { PaymentTriggerScheduleAction } from './services/PaymentTriggerScheduleAction.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: PaymentSchedule.name, schema: PaymentScheduleSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => PlanSubscriptionModule),
  ],
  providers: [PaymentScheduleCreateAction, PaymentScheduleFindAction, PaymentTriggerScheduleAction],
  exports: [PaymentScheduleCreateAction],
})
export class PaymentScheduleModule {}
