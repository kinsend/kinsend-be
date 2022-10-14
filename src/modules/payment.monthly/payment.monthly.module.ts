import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { PaymentMonthly, PaymentMonthlySchema } from './payment.monthly.schema';
import { PaymentMonthlyCreateAction } from './services/PaymentMonthlyCreateAction.service';
import { PaymentMonthlyFindConditionAction } from './services/PaymentMonthlyFindConditionAction.service';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: PaymentMonthly.name, schema: PaymentMonthlySchema }]),
  ],
  providers: [PaymentMonthlyCreateAction, PaymentMonthlyFindConditionAction],
  exports: [PaymentMonthlyCreateAction, PaymentMonthlyFindConditionAction],
})
export class PaymentMonthlyModule {}
