import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { PaymentMonthly, PaymentMonthlySchema } from './payment.monthly.schema';
import { PaymentMonthlyCreateAction } from './services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from './services/PaymentMonthlyFindConditionAction.service';
import { PaymentMonthlyFindPreviousUnpaidAction } from './services/PaymentMonthlyFindPreviousUnpaidAction.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: PaymentMonthly.name, schema: PaymentMonthlySchema }]),
  ],
  providers: [
    PaymentMonthlyCreateAction,
    PaymentMonthlyFindConditionAction,
    PaymentMonthlyFindPreviousUnpaidAction,
  ],
  exports: [
    PaymentMonthlyCreateAction,
    PaymentMonthlyFindConditionAction,
    PaymentMonthlyFindPreviousUnpaidAction,
  ],
})
export class PaymentMonthlyModule {}
