import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { MessageModule } from '../messages/message.module';
import { PaymentMonthlyModule } from '../payment.monthly/payment.monthly.module';
import { PaymentScheduleModule } from '../payment.schedule/payment.schedule.module';
import { PaymentModule } from '../payment/payment.module';
import { PlanSubscriptionModule } from '../plan-subscription/plan-subscription.module';
import { UserModule } from '../user/user.module';
import { SubscriptionCreateByCustomerIdAction } from './services/SubscriptionCreateByCustomerIdAction.service';
import { SubscriptionCreateTriggerPaymentAction } from './services/SubscriptionCreateTriggerPaymentAction.service';
import { SubscriptionGetListAction } from './services/SubscriptionGetListAction.service';
import { SubscriptionGetPricesListAction } from './services/SubscriptionGetPricesListAction.service';
import { SubscriptionGetProductsListAction } from './services/SubscriptionGetProductsListAction.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionGetListAction,
    SubscriptionGetProductsListAction,
    SubscriptionGetPricesListAction,
    SubscriptionCreateByCustomerIdAction,
    SubscriptionCreateTriggerPaymentAction,
  ],
  imports: [
    SharedModule,
    UserModule,
    PaymentScheduleModule,
    PaymentMonthlyModule,
    MessageModule,
    FormSubmissionModule,
    PaymentModule,
    PlanSubscriptionModule,
  ],
  exports: [SubscriptionCreateTriggerPaymentAction],
})
export class SubscriptionModule {}
